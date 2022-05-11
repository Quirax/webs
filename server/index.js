import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
import wrtc from 'wrtc'
import rrtc from 'recordrtc'

const WhammyRecorder = rrtc.WhammyRecorder

spawn('ffmpeg', ['-h']).on('error', function (m) {
    console.error('Not found ffmpeg on current working directory.')
    process.exit(-1)
})

let app = Express()
// app.use(Express.static('public'));
app.use(function (req, res, next) {
    if (
        req.headers.origin &&
        req.headers.origin.match(
            RegExp(`^(https?:\/\/(?:.+.)?localhost(?::d{1,5})?)`)
        )
    ) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
    }
    next()
})

const server = http.createServer({}, app)

let io = new Server(server, {
    cors: {
        origin: RegExp(`^(https?:\/\/(?:.+.)?localhost(?::d{1,5})?)`),
        methods: ['GET', 'POST'],
    },
})

io.on('connect', (socket) => {
    let errorHandler = (err) => {
        console.error(err)
        socket.emit('error', err)
    }

    socket.on('destination', async (url) => {
        try {
            if (typeof url != 'string') {
                throw `Invalid destination url - type mismatch: ${url}`
            }
            var regexValidator = /^rtmp:\/\/[^\s]*$/
            if (!regexValidator.test(url)) {
                throw `Invalid destination url - not rtmp url: ${url}`
            }
            socket._dest = url
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('start', async () => {
        try {
            if (socket._ffmpeg || socket._feeder)
                throw `Feeder is already running.`
            if (!socket._dest) throw `No destination url available.`

            console.log('Using encoder setting:')

            var option =
                '-re -i - -c:v libx264 -preset veryfast -b:v 6000k -maxrate 6000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv'

            option = option.split(' ')
            option.push(socket._dest)

            console.log(`- Options = ${option.join(' ')}`)
            console.log(`- RTMP Destination = ${socket._dest}`)

            socket._ffmpeg = spawn('ffmpeg', option)
            console.log('ffmpeg spawned.')

            socket._feeder = (data) => {
                try {
                    socket._ffmpeg.stdin.write(data)
                } catch (err) {
                    errorHandler(err)
                }
            }

            socket._ffmpeg.stderr.on('data', (d) => {
                errorHandler(d.toString())
            })

            socket._ffmpeg.on('error', (e) => {
                errorHandler(`ffmpeg caught an error: ${e}`)
            })

            socket._ffmpeg.on('exit', (e) => {
                errorHandler(`ffmpeg has been exited: ${e}`)
                socket.disconnect()
            })
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('stream', (blob) => {
        // if (!socket._feeder) {
        //     socket.emit('fatal', 'rtmp not set yet.')
        //     ffmpeg_process.stdin.end()
        //     ffmpeg_process.kill('SIGINT')
        //     return
        // }
        socket._feeder(blob)
    })

    socket.on('disconnect', () => {
        try {
            let ffmpeg = socket._ffmpeg
            let feeder = socket._feeder

            if (ffmpeg) {
                try {
                    ffmpeg.stdin.end()
                    ffmpeg.kill('SIGINT')
                    console.log('Ended ffmpeg!')
                } catch (e) {
                    errorHandler(`Error while killing ffmpeg - ${e}`)
                } finally {
                    delete socket._ffmpeg
                }
            }

            if (feeder) delete socket._feeder
        } catch (err) {
            errorHandler(err)
        }
    })
})

let port = process.env.PORT || 8080
server.listen(port, () => {
    console.info(`HTTPS and WebSocket is listening on ${port}`)
})

process.on('uncaughtException', (e) => {
    console.error(e)
})
