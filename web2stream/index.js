import fs from 'fs'
import { dirname } from 'path'
import { Writable } from 'stream'

import Puppeteer from 'puppeteer'

import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import PageVideoStreamWriter from './pageVideoStreamWriter.js'

const defaultOptions = {
    followNewTab: true,
    fps: 60,
    quality: 100,
    ffmpeg_Path: './ffmpeg.exe',
    videoFrame: {
        width: 1920,
        height: 1080,
    },
    aspectRatio: '16:9',
}

export class RTMPWriter extends PageVideoStreamWriter {
    configureVideoFile(destinationRTMP) {
        this.writerPromise = new Promise((resolve) => {
            const outputStream = this.getDestinationStream()

            outputStream
                .on('error', (e) => {
                    this.handleWriteStreamError(e.message)
                    resolve(false)
                })
                .on('end', () => resolve(true))
                .toFormat('flv')
                .save(destinationRTMP)
        })
    }
}

export class Streamer extends PuppeteerScreenRecorder {
    async startRTMP(rtmp) {
        console.log(this.options)
        this.streamWriter = new RTMPWriter(rtmp, this.options)
        return this.startStreamReader()
    }
}

const keypress = async () => {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    return new Promise((resolve) =>
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false)
            process.stdin.resume()
            resolve()
        })
    )
}

;(async () => {
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    const streamer = new Streamer(page, defaultOptions)
    await streamer.startRTMP('')
    // await streamer.start('./report/video/simple.mp4')
    await page.goto('https://www.google.com/')
    // console.log('program started, press any key to continue')
    // await keypress()
    setTimeout(async () => {
        await streamer.stop()
        await browser.close()
    }, 60000)
})()
