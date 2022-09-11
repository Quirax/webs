import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
//TODO: import .env

spawn('ffmpeg', ['-h']).on('error', function (m) {
    console.error('Not found ffmpeg on current working directory.')
    process.exit(-1)
})

// const corsOrigin = RegExp(`^(https?:\/\/(?:.+.)?qrmoo.mooo.com(?::d{1,5})?)`)
const corsOrigin = RegExp(`^(http?:\/\/(?:.+.)?localhost(?::d{1,5})?)`)

let app = Express()
// app.use(Express.static('public'));
app.use(function (req, res, next) {
    if (req.headers.origin && req.headers.origin.match(corsOrigin)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    }
    next()
})

const server = http.createServer(
    // {
    //     key: fs.readFileSync('cert/privkey.pem'),
    //     cert: fs.readFileSync('cert/cert.pem'),
    // },
    app
)

let io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
    },
})

let broadcastInfo = {
    uid: 0,
    title: '방송시험중',
    category: 'Just Chatting',
    currentScene: 0,
    currentTransition: 0,
    scene: [
        {
            name: '빨강',
            defaultCategory: 'Just Chatting',
            id: 'red',
            overlay: [
                // HACK: overlay sample
                {
                    name: '사각형',
                    type: 'shape',
                    id: 'redshape',
                    params: {
                        background_color: '#ff0000',
                        background_opacity: 1,
                        opacity: 1,
                        aspect_ratio: false,
                        radius: 0,
                        border_color: '#000000',
                        border_opacity: 1,
                        border_width: 0,
                        border_style: 'solid',
                        margin: 0,
                        padding: 0,

                        // Specific params
                        shape_type: 'rectangle',
                    },
                    transform: {
                        x: 0,
                        y: 0,
                        height: 1080,
                        width: 1920,
                        rotate: 0,
                    },
                },
            ],
        },
        {
            name: '초록',
            defaultCategory: 'Just Chatting',
            id: 'green',
            overlay: [
                // HACK: overlay sample
                {
                    name: '사각형',
                    type: 'shape',
                    id: 'greenshape',
                    params: {
                        background_color: '#00ff00',
                        background_opacity: 1,
                        opacity: 1,
                        aspect_ratio: false,
                        radius: 1,
                        border_color: '#000000',
                        border_opacity: 1,
                        border_width: 0,
                        border_style: 'solid',
                        margin: 0,
                        padding: 0,

                        // Specific params
                        shape_type: 'rectangle',
                    },
                    transform: {
                        x: 0,
                        y: 0,
                        height: 1080,
                        width: 1920,
                        rotate: 0,
                    },
                },
            ],
        },
        {
            name: '파랑',
            defaultCategory: 'Just Chatting',
            id: 'blue',
            overlay: [
                // HACK: overlay sample
                {
                    name: '사각형',
                    type: 'shape',
                    id: 'blueshape',
                    params: {
                        background_color: '#0000ff',
                        background_opacity: 1,
                        opacity: 1,
                        aspect_ratio: false,
                        radius: 1,
                        border_color: '#000000',
                        border_opacity: 1,
                        border_width: 0,
                        border_style: 'solid',
                        margin: 0,
                        padding: 0,

                        // Specific params
                        shape_type: 'rectangle',
                    },
                    transform: {
                        x: 0,
                        y: 0,
                        height: 1080,
                        width: 1920,
                        rotate: 0,
                    },
                },
            ],
        },
    ],
    transition: [
        {
            name: '기본',
            id: 'asdefault',
            type: 'slide',
            params: {
                duration: 1000,
                slide_from: 'left',
            },
        },
    ],
}

io.on('connect', (socket) => {
    const room = 'asdf'
    socket.join(room)

    let log = (message) => {
        console.log(`[${socket.id}][ log ] ${message}`)
    }
    let errorHandler = (err) => {
        console.error(`[${socket.id}][error] ${err}`)
        socket.emit('error', err)
    }

    log('Established connection')

    socket.on('getBroadcastInfo', () => {
        socket.emit('getBroadcastInfo', broadcastInfo)
    })

    socket.on('destination', async (url) => {
        try {
            if (typeof url != 'string') {
                throw `Invalid destination url - type mismatch: xxx`
            }
            var regexValidator = /^rtmp:\/\/[^\s]*$/
            if (!regexValidator.test(url)) {
                throw `Invalid destination url - not rtmp url: xxx`
            }
            socket._dest = url
            log(`Set destination to xxx`)
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('start', async () => {
        try {
            if (socket._ffmpeg || socket._feeder) throw `Streaming already running.`
            if (!socket._dest) throw `No destination url available.`

            log('Start streaming')

            var option =
                '-re -i - -c:v libx264 -preset veryfast -b:v 6000k -maxrate 6000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv -loglevel repeat+level+error -vf scale=1920:1080'

            option = option.split(' ')
            option.push(socket._dest)

            socket._ffmpeg = spawn('ffmpeg', option)

            log('Spawned ffmpeg')

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
                log(`ffmpeg has been exited: ${e}`)
                socket.disconnect()
            })

            log('Started streaming')
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('stream', (blob) => {
        socket._feeder(blob)
    })

    socket.on('disconnect', async () => {
        try {
            let ffmpeg = socket._ffmpeg
            let feeder = socket._feeder

            if (ffmpeg) {
                try {
                    ffmpeg.stdin.end()
                    ffmpeg.kill('SIGINT')
                    log('Ended ffmpeg')
                } catch (e) {
                    errorHandler(`Error while killing ffmpeg - ${e}`)
                } finally {
                    delete socket._ffmpeg
                }
            }

            if (feeder) delete socket._feeder
        } catch (err) {
            errorHandler(err)
        } finally {
            log('Disconnected')
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
