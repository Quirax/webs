import { EventEmitter } from 'events'
import os from 'os'
import { extname } from 'path'
import { PassThrough, Writable } from 'stream'
import ffmpeg from 'fluent-ffmpeg'
import { SupportedFileFormats, VIDEO_WRITE_STATUS } from './pageVideoStreamTypes.js'

const { setFfmpegPath } = ffmpeg

/**
 * @ignore
 */
const SUPPORTED_FILE_FORMATS = [
    SupportedFileFormats.MP4,
    SupportedFileFormats.AVI,
    SupportedFileFormats.MOV,
    SupportedFileFormats.WEBM,
]
/**
 * @ignore
 */
export default class PageVideoStreamWriter extends EventEmitter {
    constructor(destinationSource, options) {
        super()
        this.screenLimit = 40
        this.screenCastFrames = []
        this.duration = '00:00:00:00'
        this.status = VIDEO_WRITE_STATUS.NOT_STARTED
        this.videoMediatorStream = new PassThrough()
        if (options) {
            this.options = options
        }
        const isWritable = this.isWritableStream(destinationSource)
        this.configureFFmPegPath()
        if (isWritable) {
            this.configureVideoWritableStream(destinationSource)
        } else {
            this.configureVideoFile(destinationSource)
        }
    }
    get videoFrameSize() {
        const { width, height } = this.options.videoFrame
        return width !== null && height !== null ? `${width}x${height}` : '100%'
    }
    get autopad() {
        const autopad = this.options.autopad
        return !autopad ? { activation: false } : { activation: true, color: autopad.color }
    }
    getFfmpegPath() {
        if (this.options.ffmpeg_Path) {
            return this.options.ffmpeg_Path
        }
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const ffmpeg = require('@ffmpeg-installer/ffmpeg')
            if (ffmpeg.path) {
                return ffmpeg.path
            }
            return null
        } catch (e) {
            return null
        }
    }
    getDestinationPathExtension(destinationFile) {
        const fileExtension = extname(destinationFile)
        return fileExtension.includes('.') ? fileExtension.replace('.', '') : fileExtension
    }
    configureFFmPegPath() {
        const ffmpegPath = this.getFfmpegPath()
        if (!ffmpegPath) {
            throw new Error('FFmpeg path is missing, \n Set the FFMPEG_PATH env variable')
        }
        setFfmpegPath(ffmpegPath)
    }
    isWritableStream(destinationSource) {
        if (destinationSource && typeof destinationSource !== 'string') {
            if (
                !(destinationSource instanceof Writable) ||
                !('writable' in destinationSource) ||
                !destinationSource.writable
            ) {
                throw new Error('Output should be a writable stream')
            }
            return true
        }
        return false
    }
    configureVideoFile(destinationPath) {
        const fileExt = this.getDestinationPathExtension(destinationPath)
        if (!SUPPORTED_FILE_FORMATS.includes(fileExt)) {
            throw new Error('File format is not supported')
        }
        this.writerPromise = new Promise((resolve) => {
            const outputStream = this.getDestinationStream()
            outputStream
                .on('error', (e) => {
                    this.handleWriteStreamError(e.message)
                    resolve(false)
                })
                .on('end', () => resolve(true))
                .save(destinationPath)
            if (fileExt == SupportedFileFormats.WEBM) {
                outputStream
                    .videoCodec('libvpx')
                    .videoBitrate(1000, true)
                    .outputOptions('-flags', '+global_header', '-psnr')
            }
        })
    }
    configureVideoWritableStream(writableStream) {
        this.writerPromise = new Promise((resolve) => {
            const outputStream = this.getDestinationStream()
            outputStream
                .on('error', (e) => {
                    writableStream.emit('error', e)
                    resolve(false)
                })
                .on('end', () => {
                    writableStream.end()
                    resolve(true)
                })
            outputStream.toFormat('mp4')
            outputStream.addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
            outputStream.pipe(writableStream)
        })
    }
    getDestinationStream() {
        const cpu = Math.max(1, os.cpus().length - 1)
        const outputStream = ffmpeg({
            source: this.videoMediatorStream,
            priority: 20,
        })
            .videoCodec('libx264')
            .size(this.videoFrameSize)
            .aspect(this.options.aspectRatio || '4:3')
            .autopad(this.autopad.activation, this.autopad?.color)
            .inputFormat('image2pipe')
            .inputFPS(this.options.fps)
            .outputOptions('-preset ultrafast')
            .outputOptions('-pix_fmt yuv420p')
            .outputOptions('-minrate 1000')
            .outputOptions('-maxrate 1000')
            .outputOptions('-framerate 1')
            .outputOptions(`-threads ${cpu}`)
            .on('progress', (progressDetails) => {
                this.duration = progressDetails.timemark
            })
        if (this.options.recordDurationLimit) {
            outputStream.duration(this.options.recordDurationLimit)
        }
        return outputStream
    }
    handleWriteStreamError(errorMessage) {
        this.emit('videoStreamWriterError', errorMessage)
        if (this.status !== VIDEO_WRITE_STATUS.IN_PROGRESS && errorMessage.includes('pipe:0: End of file')) {
            return
        }
        return console.error(`Error unable to capture video stream: ${errorMessage}`)
    }
    findSlot(timestamp) {
        if (this.screenCastFrames.length === 0) {
            return 0
        }
        let i
        let frame
        for (i = this.screenCastFrames.length - 1; i >= 0; i--) {
            frame = this.screenCastFrames[i]
            if (timestamp > frame.timestamp) {
                break
            }
        }
        return i + 1
    }
    insert(frame) {
        // reduce the queue into half when it is full
        if (this.screenCastFrames.length === this.screenLimit) {
            const numberOfFramesToSplice = Math.floor(this.screenLimit / 2)
            const framesToProcess = this.screenCastFrames.splice(0, numberOfFramesToSplice)
            this.processFrameBeforeWrite(framesToProcess)
        }
        const insertionIndex = this.findSlot(frame.timestamp)
        if (insertionIndex === this.screenCastFrames.length) {
            this.screenCastFrames.push(frame)
        } else {
            this.screenCastFrames.splice(insertionIndex, 0, frame)
        }
    }
    trimFrame(fameList) {
        if (!this.lastProcessedFrame) {
            this.lastProcessedFrame = fameList[0]
        }
        return fameList.map((currentFrame) => {
            const duration = currentFrame.timestamp - this.lastProcessedFrame.timestamp
            this.lastProcessedFrame = currentFrame
            return {
                ...currentFrame,
                duration,
            }
        })
    }
    processFrameBeforeWrite(frames) {
        const processedFrames = this.trimFrame(frames)
        processedFrames.forEach(({ blob, duration }) => {
            this.write(blob, duration)
        })
    }
    write(data, durationSeconds = 1) {
        this.status = VIDEO_WRITE_STATUS.IN_PROGRESS
        const NUMBER_OF_FPS = Math.max(Math.floor(durationSeconds * this.options.fps), 1)
        for (let i = 0; i < NUMBER_OF_FPS; i++) {
            this.videoMediatorStream.write(data)
        }
    }
    drainFrames(stoppedTime) {
        this.processFrameBeforeWrite(this.screenCastFrames)
        this.screenCastFrames = []
        if (!this.lastProcessedFrame) return
        const durationSeconds = stoppedTime - this.lastProcessedFrame.timestamp
        this.write(this.lastProcessedFrame.blob, durationSeconds)
    }
    stop(stoppedTime = Date.now() / 1000) {
        if (this.status === VIDEO_WRITE_STATUS.COMPLETED) {
            return this.writerPromise
        }
        this.drainFrames(stoppedTime)
        this.videoMediatorStream.end()
        this.status = VIDEO_WRITE_STATUS.COMPLETED
        return this.writerPromise
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZVZpZGVvU3RyZWFtV3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9wYWdlVmlkZW9TdHJlYW1Xcml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUN0QyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUUvQyxPQUFPLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV0RCxPQUFPLEVBRUwsb0JBQW9CLEVBQ3BCLGtCQUFrQixHQUVuQixNQUFNLHdCQUF3QixDQUFDO0FBRWhDOztHQUVHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRztJQUM3QixvQkFBb0IsQ0FBQyxHQUFHO0lBQ3hCLG9CQUFvQixDQUFDLEdBQUc7SUFDeEIsb0JBQW9CLENBQUMsR0FBRztJQUN4QixvQkFBb0IsQ0FBQyxJQUFJO0NBQzFCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8scUJBQXNCLFNBQVEsWUFBWTtJQVk3RCxZQUFZLGlCQUFvQyxFQUFFLE9BQXNCO1FBQ3RFLEtBQUssRUFBRSxDQUFDO1FBWk8sZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFDMUIscUJBQWdCLEdBQUcsRUFBRSxDQUFDO1FBRXZCLGFBQVEsR0FBRyxhQUFhLENBQUM7UUFFeEIsV0FBTSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztRQUd4Qyx3QkFBbUIsR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQU0zRCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQ3hCO1FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxD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
