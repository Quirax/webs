import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
import wrtc from 'wrtc'
//TODO: import .env

const wrtc_cfg = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
            // credential: 'webrtc',
            // username: 'webrtc',
        },
    ],
}

spawn('ffmpeg', ['-h']).on('error', function (m) {
    console.error('Not found ffmpeg on current working directory.')
    process.exit(-1)
})

// const corsOrigin = RegExp(`^(https?:\/\/(?:.+.)?qrmoo.mooo.com(?::d{1,5})?)`)
const corsOrigin = RegExp(`^(https?:\/\/(?:.+.)?localhost(?::d{1,5})?)`)

let app = Express()
// app.use(Express.static('public'));
app.use(function (req, res, next) {
    if (req.headers.origin && req.headers.origin.match(corsOrigin)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    }
    next()
})

const server = https.createServer(
    {
        key: fs.readFileSync('cert/localhost.key'),
        cert: fs.readFileSync('cert/localhost.crt'),
    },
    // {
    //     key: fs.readFileSync('cert/privkey.pem', 'utf8'),
    //     cert: fs.readFileSync('cert/fullchain.pem', 'utf8'),
    //     // ca: [fs.readFileSync('cert/fullchain.pem', 'utf8')],
    //     // requestCert: false,
    //     // rejectUnauthorized: false,
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
                    name: '동영상',
                    type: 'display',
                    id: 'videotest1',
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
                        src_type: 'url',
                        src: 'https://www.youtube.com/watch?v=FDSf6n_Bemk',
                    },
                    transform: {
                        x: 0,
                        y: 0,
                        height: 480,
                        width: 640,
                        rotate: 0,
                    },
                },
            ],
        },
        {
            name: '빨강2',
            defaultCategory: 'Just Chatting',
            id: 'redred',
            overlay: [],
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

const streams = {}

io.on('connect', (socket) => {
    const room = 'asdf'
    const room_preview = room + '_preview'
    socket.join(room)
    socket.isPreview = false

    if (!streams[room]) streams[room] = {}

    let log = (message) => {
        console.log(`[${socket.id}][ log ] ${message}`)
    }
    let errorHandler = (err) => {
        console.error(`[${socket.id}][error] ${err}`)
        socket.emit('error', err)
    }

    log('Established connection')

    socket.on('isPreview', (ip) => {
        if (!ip) return
        socket.isPreview = true
        socket.join(room_preview)

        for (let id in streams[room]) {
            socket.emit('streamConnect', { id: id })
        }
    })

    socket.on('getBroadcastInfo', () => {
        socket.emit('getBroadcastInfo', broadcastInfo)
    })

    socket.on('onChange', (info) => {
        socket.to(room).emit('getBroadcastInfo', info)
    })

    socket.on('afterChange', (info) => {
        broadcastInfo = info
        socket.to(room).emit('getBroadcastInfo', info)
    })

    socket.on('selectScene', (idx) => {
        broadcastInfo.currentScene = idx
        socket.to(room).emit('selectScene', idx)
    })

    socket.on('registerElement', (id) => {
        if (socket.eventNames().indexOf('event_' + id) > -1) return
        socket.on('event_' + id, (params) => {
            socket.to(room).emit('event_' + id, params)
        })
    })

    socket.on('unregisterElement', (id) => {
        socket.offAny('event_' + id)
    })

    socket.on('streamSenderCandidate', async (data) => {
        try {
            let pc = streams[room][data.id].sender
            await pc.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate))
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('streamSenderOffer', async (data) => {
        try {
            // let pc = createReceiverPeerConnection(data.senderSocketID, socket, data.roomID)
            let pc = new wrtc.RTCPeerConnection(wrtc_cfg)
            if (!streams[room][data.id]) streams[room][data.id] = {}
            streams[room][data.id].sender = pc

            pc.onicecandidate = (e) => {
                socket.emit('streamSenderCandidate', {
                    candidate: e.candidate,
                    id: data.id,
                })
            }

            pc.oniceconnectionstatechange = (e) => {}

            pc.ontrack = (e) => {
                streams[room][data.id].stream = e.streams[0]

                socket.to(room_preview).emit('streamConnect', { id: data.id })
            }

            await pc.setRemoteDescription(new wrtc.RTCSessionDescription(data.sdp))

            let sdp = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            })
            await pc.setLocalDescription(new wrtc.RTCSessionDescription(sdp))
            socket.emit('streamSenderAnswer', { sdp, id: data.id })
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('streamReceiverCandidate', async (data) => {
        try {
            let pc = streams[room][data.id].receiver
            await pc.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate))
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('streamReceiverOffer', async (data) => {
        try {
            // let pc = createReceiverPeerConnection(data.senderSocketID, socket, data.roomID)
            let pc = new wrtc.RTCPeerConnection(wrtc_cfg)
            if (!streams[room][data.id]) streams[room][data.id] = {}
            streams[room][data.id].receiver = pc

            pc.onicecandidate = (e) => {
                socket.emit('streamReceiverCandidate', {
                    candidate: e.candidate,
                    id: data.id,
                })
            }

            pc.oniceconnectionstatechange = (e) => {}

            streams[room][data.id].stream.getTracks().forEach((track) => {
                pc.addTrack(track, streams[room][data.id].stream)
            })

            await pc.setRemoteDescription(new wrtc.RTCSessionDescription(data.sdp))

            let sdp = await pc.createAnswer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false,
            })
            await pc.setLocalDescription(new wrtc.RTCSessionDescription(sdp))
            socket.emit('streamReceiverAnswer', { sdp, id: data.id })
        } catch (error) {
            console.log(error)
        }
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

            if (socket.isPreview)
                for (let id in streams[room]) streams[room][id].receiver && streams[room][id].receiver.close()
            else for (let id in streams[room]) streams[room][id].sender && streams[room][id].sender.close()
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
