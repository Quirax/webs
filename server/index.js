import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
import wrtc from 'wrtc'
import fetch from 'node-fetch'

import './env.js'

import db from './db/index.js'

const wrtc_cfg = {
    iceServers: [
        {
            urls: ['stun:meet-jit-si-turnrelay.jitsi.net:443'],
            username: '',
            credential: '',
        },
        {
            urls: ['stun:stun.nextcloud.com:443'],
            username: '',
            credential: '',
        },
    ],
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceCandidatePoolSize: 0,
    sdpSemantics: 'unified-plan',
    extmapAllowMixed: true,
}

spawn('ffmpeg', ['-h']).on('error', function (m) {
    console.error('Not found ffmpeg on current working directory.')
    process.exit(-1)
})

// const corsOrigin = RegExp(`^(https?:\/\/(?:.+.)?qrmoo.mooo.com(?::d{1,5})?)`)
const corsOrigin = RegExp(`^(https?:\/\/(?:.+.)?${process.env.HOST}(?::d{1,5})?)`)

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
    process.env.HOST === 'localhost'
        ? {
              key: fs.readFileSync('cert/localhost.key'),
              cert: fs.readFileSync('cert/localhost.crt'),
          }
        : {
              key: fs.readFileSync('cert/privkey.pem', 'utf8'),
              cert: fs.readFileSync('cert/fullchain.pem', 'utf8'),
          },
    app
)

let io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST'],
    },
})

let broadcastInfo = null

const streams = {}

io.on('connect', async (socket) => {
    const uid = socket.handshake.query.uid
    const room = uid
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

    log(`Established connection with client (uid = ${uid})`)

    try {
        broadcastInfo = await db.get(uid)
        if (broadcastInfo === null) {
            broadcastInfo = db.newUser(uid)
            await db.save(broadcastInfo)
        }
    } catch (e) {
        return console.error(e)
    }

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

    socket.on('afterChange', async (info) => {
        // broadcastInfo = new db.BI(info)

        try {
            // await db.save(broadcastInfo)
            broadcastInfo.overwrite(info)
            await db.save(broadcastInfo)
        } catch (e) {
            console.error(e)
        } finally {
            socket.to(room).emit('getBroadcastInfo', info)
        }
    })

    socket.on('setDescription', async ({ category_id, title }) => {
        broadcastInfo.category = category_id
        broadcastInfo.title = title

        try {
            await db.save(broadcastInfo)
        } catch (e) {
            console.error(e)
        }
    })

    socket.on('selectScene', async (idx) => {
        broadcastInfo.currentScene = idx

        try {
            await db.save(broadcastInfo)
        } catch (e) {
            console.error(e)
        } finally {
            socket.to(room).emit('selectScene', idx)
        }
    })

    socket.on('registerElement', (id) => {
        socket.to(room).emit('event_' + id, { type: 'connect' })
        if (socket.eventNames().indexOf('event_' + id) > -1) return
        socket.on('event_' + id, (params) => {
            socket.to(room).emit('event_' + id, params)
        })
    })

    socket.on('unregisterElement', (id) => {
        socket.offAny('event_' + id)
        socket.to(room).emit('event_' + id, { type: 'disconnect' })
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

    socket.on('disconnectStream', (id) => {
        if (socket.isPreview) {
            return
        } else {
            if (!streams[room][id]) return
            streams[room][id].stream &&
                streams[room][id].stream.getTracks().forEach((t) => {
                    t.stop()
                })
            streams[room][id].sender && streams[room][id].sender.close()
            streams[room][id].receiver && streams[room][id].receiver.close()
            delete streams[room][id]
            console.log(streams[room][id] || 'deleted: ' + id)
        }
    })

    socket.on('start', async (dest) => {
        try {
            if (typeof dest != 'string') {
                throw `Invalid destination url - type mismatch: xxx`
            }
            var regexValidator = /^rtmp:\/\/[^\s]*$/
            if (!regexValidator.test(dest)) {
                throw `Invalid destination url - not rtmp url: xxx`
            }

            const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs`
            const out_name = `${room}_rtmp`

            const body = {
                url: `https://qrmoo.mooo.com/preview?id=${uid}`,
                outputName: out_name,
                rtmpUrl: dest,
            }

            log(JSON.stringify(body))

            const r = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const resp = await r.json()

            socket._jobId = resp.jobId

            log(`Started streaming (jobId = ${resp.jobId}, outputName = ${out_name})`)
        } catch (err) {
            errorHandler(err)
        }
    })

    async function stop() {
        try {
            //TODO : 시작 전에 먼저 종료했을 때 제대로 종료되지 않는 문제 해결
            if (!socket._jobId) return

            const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs/${socket._jobId}/stop`

            const resp = await (
                await fetch(url, {
                    method: 'POST',
                })
            ).text()

            if (resp !== '"ok"') {
                errorHandler(resp)
            }
        } catch (err) {
            errorHandler(err)
        } finally {
            delete socket._jobId
            log('Stopped')
        }
    }

    socket.on('stop', async () => {
        try {
            await stop()
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('disconnect', async () => {
        try {
            await stop()

            if (socket.isPreview) return
            else
                for (let id in streams[room]) {
                    streams[room][id].sender && streams[room][id].sender.close()
                    streams[room][id].receiver && streams[room][id].receiver.close()
                    delete streams[room][id]
                }
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
