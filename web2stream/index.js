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
    fps: 30,
    quality: 75,
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
                //source: this.videoMediatorStream,
                priority: 20,
            })
                .input(this.videoMediatorStream)
                .inputFormat('image2pipe')
                .inputOptions([
                    '-thread_queue_size 2048',
                    '-fflags +genpts',
                    //'-itsoffset 00:00:06',
                    //'-framerate 50',
                    '-framerate 25',
                    //'-vf fps=30,tpad=stop=-1=stop_mode=clone'
                ])
                .input(this.options.outputname + '.monitor')
                .inputFormat('pulse')
                .inputOptions(['-thread_queue_size 2048', '-itsoffset 0', '-ar 44100'])
                /*.inputOptions([
		    //'-async 5',
		    '-f',
		    'pulse',
		    // '-ac',
		    // '2',
		    '-i',
		    this.options.outputname + '.monitor',
		    // '-acodec',
		    // 'aac',
		    '-thread_queue_size',
		    '2048',
		])*/
                .videoCodec('libx264')
                //.size('1280x720')
                //.aspect(this.options.aspectRatio || '4:3')
                //.autopad(this.autopad.activation, this.autopad?.color)
                /*.inputFormat('image2pipe')
		.inputOptions('-thread_queue_size 2048')
		.inputOptions('-fflags +genpts')
		.inputOptions('-itsoffset 00:00:00.5')
		.inputOptions('-filter:v fps=30')*/
                .videoCodec('h264')
                .audioCodec('copy')
                // .inputFPS(this.options.fps)
                .outputOptions('-preset ultrafast')
                //.outputOptions('-crf 51')
                .outputOptions('-tune zerolatency')
                .outputOptions('-movflags +faststart')
                .outputOptions('-pix_fmt yuv420p')
                //.outputOptions('-profile:v baseline')
                .outputOptions('-g 40')
                // .outputOptions('-vb 128k')
                .outputOptions('-b:v 1M')
                .outputOptions('-maxrate 2000k')
                .outputOptions('-bufsize 1M')
                // .outputOptions('-framerate 1')
                //.outputFPS(this.options.fps)
                .outputOptions(`-threads 4`)
                //.outputOptions('-thread_queue_size 2048')
                .outputOptions(
                    '-filter:v ' +
                        //+ 'loop=loop=-1:size=1:start=0,'
                        //+ 'format=yuv420p,'
                        'setpts=0.5*PTS,' +
                        'scale=w=1280:h=720,' +
                        'fps=fps=25:start_time=0,' +
                        'tpad=start_duration=0:color=black:stop=-1:stop_mode=clone'
                )
                .outputOptions('-shortest')
                //.outputOptions('-r:v 25')
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
    const TARGET_URL = 'https://www.youtube.com/watch?v=RVHLH5n_G7A' //'https://qrmoo.mooo.com/preview'

    const browser = await Puppeteer.launch({
        args: [
            '--window-size=1920,1080',
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
            '--audio-service-quit-timeout-ms=-1',
            '--enable-exclusive-audio',
            '--enable-features=AudioServiceLaunchOnStartup',
        ],
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
    await page.goto(TARGET_URL)

    //executeAfterPageLoaded
    const inputIdList = await getInputId(browser.process().pid)

    for (let inputId of inputIdList) await moveInput(inputId, sinkId)

    await streamer.startRTMP('rtmp://sel04.contribute.live-video.net/app/live_268220424_FTCOGuIAv8IjxL1yVmiAleSEcA1LZj')
    // await streamer.start('./report/video/simple.mp4')
    console.log(`Chrome is streamed to rtmp server with pid ${browser.process().pid}`)
    // await keypress()
    // setTimeout(async () => {
    //     await streamer.stop()
    //     await browser.close()
    // }, 10000)
})()
