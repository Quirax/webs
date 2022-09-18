import fs from 'fs'
import { dirname } from 'path'
import { Writable } from 'stream'

import Puppeteer from 'puppeteer'

import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import PageVideoStreamWriter from './pageVideoStreamWriter.js'

import os from 'os'

import ffmpeg from 'fluent-ffmpeg'

import { start as PAStart, setDefaultSink, createSink, getInputId, moveInput } from './pulseaudio.js'

const defaultOptions = {
    followNewTab: true,
    fps: 60,
    quality: 100,
    ffmpeg_Path: 'ffmpeg',
    videoFrame: {
        width: 1920,
        height: 1080,
    },
    aspectRatio: '16:9',
}

export class RTMPWriter extends PageVideoStreamWriter {
    configureVideoFile(destinationRTMP) {
        //ffmpegProcessParams (fps, audioofffset, outputname, rtmp)

        this.writerPromise = new Promise((resolve) => {
            const cpu = Math.max(1, os.cpus().length - 1)
            const outputStream = ffmpeg({
                source: this.videoMediatorStream,
                priority: 20,
            })
                .inputOptions([
                    '-thread_queue_size',
                    '1024',
                    '-itsoffset',
                    '0',
                    '-f',
                    'pulse',
                    // '-ac',
                    // '2',
                    '-i',
                    this.options.outputname + '.monitor',
                    // '-acodec',
                    // 'aac',
                ])
                .videoCodec('libx264')
                .size(this.videoFrameSize)
                .aspect(this.options.aspectRatio || '4:3')
                .autopad(this.autopad.activation, this.autopad?.color)
                .inputFormat('image2pipe')
                .inputOptions(['-thread_queue_size 1024'])
                .inputFPS(this.options.fps)
                .outputOptions('-preset ultrafast')
                .outputOptions('-pix_fmt yuv420p')
                // .outputOptions('-minrate 1000')
                // .outputOptions('-maxrate 1000')
                .outputOptions('-framerate 1')
                // .outputFPS(this.options.fps)
                .outputOptions(`-threads ${cpu}`)
                .on('progress', (progressDetails) => {
                    this.duration = progressDetails.timemark
                })
                .on('stderr', (outputs) => {
                    console.log(outputs)
                })

            if (this.options.recordDurationLimit) {
                outputStream.duration(this.options.recordDurationLimit)
            }

            outputStream
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
}

export class Streamer extends PuppeteerScreenRecorder {
    async startRTMP(rtmp) {
        this.streamWriter = new RTMPWriter(rtmp, this.options)
        return this.startStreamReader()
    }
}

;(async () => {
    const OUTPUT_NAME = 'streamtest'
    const TARGET_URL = 'https://www.youtube.com/watch?v=HOVp2jqWzSM'

    const browser = await Puppeteer.launch({
        args: ['--window-size=1920,1080', '--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
        ignoreDefaultArgs: ['--mute-audio'],
        // headless: false,
        defaultViewport: null,
    })

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
    await page.goto(TARGET_URL, {
        waitUntil: 'load',
    })

    //executeAfterPageLoaded
    const inputIdList = await getInputId(browser.process().pid)

    for (let inputId of inputIdList) await moveInput(inputId, sinkId)

    await streamer.startRTMP('')
    // await streamer.start('./report/video/simple.mp4')
    console.log(`Chrome is streamed to rtmp server with pid ${browser.process().pid}`)
    // await keypress()
    setTimeout(async () => {
        await streamer.stop()
        await browser.close()
    }, 10000)
})()
