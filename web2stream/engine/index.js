import Puppeteer from 'puppeteer'

import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import PageVideoStreamWriter from './pageVideoStreamWriter.js'
import { VIDEO_WRITE_STATUS } from './pageVideoStreamTypes.js'

import os from 'os'

import ffmpeg from 'fluent-ffmpeg'

import { start as PAStart, setDefaultSink, createSink, getInputId, moveInput } from './pulseaudio.js'

import args from './arguments.js'

import { PassThrough } from 'stream'
import fs from 'fs'

const defaultOptions = {
    followNewTab: true,
    fps: 30,
    quality: 80,
    ffmpeg_Path: 'ffmpeg',
    videoFrame: {
        width: 1920,
        height: 1080,
    },
    aspectRatio: '16:9',
}

class RTMPWriter extends PageVideoStreamWriter {
    getDestinationStream() {
        const cpu = Math.max(1, os.cpus().length - 1)
        return ffmpeg({
            priority: 20,
        })
            .input(this.videoMediatorStream)
            .inputFormat('image2pipe')
            .inputOptions([
                '-thread_queue_size 2048',
                '-fflags +genpts',
                `-framerate ${this.options.fps}`,
                '-use_wallclock_as_timestamps true',
            ])
            .input(this.options.outputname + '.monitor')
            .inputFormat('pulse')
            .inputOptions(['-thread_queue_size 2048', '-itsoffset 0', '-ar 44100', '-use_wallclock_as_timestamps true'])
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-vsync 1', `-r:v ${this.options.fps}`])
            .outputOptions(['-preset ultrafast', '-tune zerolatency', '-movflags +faststart', '-shortest'])
            .outputOptions(['-b:v 1M', '-maxrate 2000k', '-bufsize 1M'])
            .outputOptions(`-threads ${cpu}`)
            .outputOptions([
                '-pix_fmt yuv420p',
                '-filter:v ' + ['scale=w=1280:h=720'].join(','),
                '-filter:a ' + ['asetpts=(N/SR+1.451)/TB'].join(','),
            ])
            .on('progress', (progressDetails) => {
                this.duration = progressDetails.timemark
            })
        // .on('stderr', (outputs) => {
        //     console.log(outputs)
        // })
    }

    configureVideoFile(destinationRTMP) {
        if (!destinationRTMP) return this.configureVideoHLS()
        //ffmpegProcessParams (fps, audioofffset, outputname, rtmp)
        this.writerPromise = new Promise((resolve) => {
            this.getDestinationStream()
                .on('error', (e) => {
                    this.handleWriteStreamError(e.message)
                    resolve(false)
                })
                .on('end', () => resolve(true))
                .toFormat('flv')
                .outputOptions('-flvflags no_duration_filesize')
                .save(destinationRTMP)
        })
    }
    configureVideoHLS() {
        this.writerPromise = new Promise((resolve) => {
            const outputStream = this.getDestinationStream()
            outputStream
                .on('error', (e) => {
                    this.handleWriteStreamError(e.message)
                    //writableStream.emit('error', e)
                    resolve(false)
                })
                .on('end', () => {
                    writableStream.end()
                    resolve(true)
                })
                .toFormat('ssegment')
                .outputOptions([
                    `-segment_list /var/hls/${this.options.outputname}/playlist.m3u8`,
                    '-segment_list_type hls',
                    '-segment_list_size 6',
                    '-segment_list_flags +live',
                    '-segment_time 10',
                    '-segment_wrap 6',
                ])
                .save(`/var/hls/${this.options.outputname}/out%02d.ts`)
        })
    }
    duplicate() {
        if (this.screenCastFrames.length > 0) {
            this.insert({
                blob: -1,
                timestamp: Date.now() / 1000,
            })
        }
    }
    write(data, durationSeconds = 1) {
        this.status = VIDEO_WRITE_STATUS.IN_PROGRESS
        const NUMBER_OF_FPS = Math.max(Math.floor(durationSeconds * this.options.fps), 1)
        if (data !== -1) this.lastBlob = data
        for (let i = 0; i < NUMBER_OF_FPS; i++) {
            this.videoMediatorStream.write(this.lastBlob)
        }
    }
}

class Streamer extends PuppeteerScreenRecorder {
    constructor(page, options = {}) {
        super(page, options)
        this.duplicator = null
    }

    setupListeners() {
        super.setupListeners()
        this.duplicator = setInterval(() => {
            this.streamWriter.duplicate()
        }, 1000 / this.options.fps)
    }

    async startRTMP(rtmp) {
        this.streamWriter = new RTMPWriter(rtmp, this.options)
        return this.startStreamReader()
    }

    async stop() {
        await super.stop()
        clearInterval(this.duplicator)
    }
}

;(async () => {
    const OUTPUT_NAME = args.getOutputName()
    const TARGET_URL = args.getUrl()

    const browser = await Puppeteer.launch({
        args: [
            '--window-size=1920,1080',
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
            '--audio-service-quit-timeout-ms=-1',
            '--enable-features=AudioServiceLaunchOnStartup',
            '--disable-features=AudioServiceOutOfProcess',
        ],
        ignoreDefaultArgs: ['--mute-audio'],
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome-stable',
    })
    console.log(`Started at ${process.cwd()}`)
    console.log(`Chrome is streamed to rtmp server with pid ${browser.process().pid}`)

    //initPulseAudio
    let sinkId

    try {
        await PAStart()
        await setDefaultSink()
        sinkId = await createSink(OUTPUT_NAME)
    } catch (err) {
        console.log('Error on initPulseAudio phase: ' + err)
        return
    }

    const page = await browser.newPage()
    const streamer = new Streamer(page, {
        ...defaultOptions,
        outputname: OUTPUT_NAME,
    })
    await page.goto('https://youtube.com/watch?v=g4mHPeMGTJM') // Connect audio first

    process.on('message', async (msg) => {
        try {
            switch (msg.cmd) {
                case 'viewport':
                    await page.setViewport({ height: msg.height, width: msg.width })
                    process.send && process.send({ event: 'viewport', height: msg.height, width: msg.width })
                    break
                default:
            }
        } catch (err) {
            process.send && process.send({ event: 'error', desc: err })
        }
    })

    //executeAfterPageLoaded
    const inputIdList = await getInputId(browser.process().pid)

    for (let inputId of inputIdList) await moveInput(inputId, sinkId)

    let rtmp_url = args.getRtmpUrl()
    if (rtmp_url) streamer.startRTMP(rtmp_url)
    else {
        if (!fs.existsSync(`/var/hls/${OUTPUT_NAME}`)) fs.mkdirSync(`/var/hls/${OUTPUT_NAME}`, { recursive: true })
        streamer.startRTMP(undefined)
    }

    await page.goto(TARGET_URL)
})()
