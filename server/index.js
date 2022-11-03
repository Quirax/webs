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

let router = Express.Router() // get an instance of the express Router

function doNotFound(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('404 Not Found')
}

router.get('/:id/playlist.m3u8', async (req, res) => {
    const jobId = req.params.id

    const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs/${jobId}/playlist.m3u8`

    try {
        const resp = await fetch(url, {
            method: 'GET',
        })
        if (resp.status === 404) {
            doNotFound(res)
        } else resp.body.pipe(res)
    } catch (err) {
        console.log(err)
    }
})

router.get('/:id/:ts(out\\d+.ts)', async (req, res) => {
    const jobId = req.params.id
    const ts = req.params.ts

    const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs/${jobId}/${ts}`

    try {
        const resp = await fetch(url, {
            method: 'GET',
        })
        if (resp.status === 404) {
            doNotFound(res)
        } else resp.body.pipe(res)
    } catch (err) {
        console.log(err)
    }
})

app.use('/hls', router)

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
const browsers = {}

io.on('connect', async (socket) => {
    const uid = socket.handshake.query.uid
    const room = uid
    const room_preview = room + '_preview'
    socket.join(room)
    socket.isPreview = false

    if (!streams[room]) streams[room] = {}
    if (!browsers[room]) browsers[room] = {}

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

    log(`Got broadcast info of client (uid = ${uid})`)

    log('Sending boradcast info: ' + broadcastInfo._id)
    socket.emit('getBroadcastInfo', broadcastInfo)

    socket.on('isPreview', (ip) => {
        if (!ip) return
        socket.isPreview = true
        socket.join(room_preview)

        for (let id in streams[room]) {
            socket.emit('streamConnect', { id: id })
        }
    })

    socket.on('getBroadcastInfo', () => {
        log('Sending boradcast info: ' + broadcastInfo._id)
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

    socket.on('setDescription', ({ category_id, title }) => {
        broadcastInfo.category = category_id
        broadcastInfo.title = title

        setTimeout(async () => {
            try {
                await db.save(broadcastInfo)
            } catch (e) {
                console.error(e)
            }
        }, 100)
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

    async function start(target, out_name, dest) {
        const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs`

        const body = {
            url: target,
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

        return resp.jobId
    }

    socket.on('start', async (dest) => {
        try {
            if (typeof dest != 'string') {
                throw `Invalid destination url - type mismatch: xxx`
            }
            var regexValidator = /^rtmp:\/\/[^\s]*$/
            if (!regexValidator.test(dest)) {
                throw `Invalid destination url - not rtmp url: xxx`
            }

            const out_name = `${room}_rtmp`

            socket._jobId = await start(`https://qrmoo.mooo.com/preview?id=${uid}`, `${room}_rtmp`, dest)

            log(`Started streaming (jobId = ${socket._jobId}, outputName = ${out_name})`)
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('streamBrowser', async (id, url) => {
        try {
            if (typeof url != 'string') {
                throw `Invalid destination url - type mismatch: xxx`
            }

            let jobId = Object.keys(browsers[room]).find((key) => browsers[room][key] === url)

            if (jobId) {
                if (typeof browsers[room][jobId] !== 'number') socket.emit(`streamBrowser_${id}`, jobId)

                return
            }

            const out_name = `${room}_${id}`

            jobId = await start(url, out_name, '')

            browsers[room][jobId] = setTimeout(() => {
                browsers[room][jobId] = url
                socket.emit(`streamBrowser_${id}`, jobId)
                log(`Started browser (jobId = ${jobId}, outputName = ${out_name})`)
            }, 15000)

            log(`Waiting for browser (jobId = ${jobId}, outputName = ${out_name})`)
        } catch (err) {
            errorHandler(err)
        }
    })

    socket.on('browserMessage', async (id, jobId, message) => {
        try {
            if (!browsers[room][jobId]) return socket.emit(`browserMessage_${id}`, false)

            const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs/${jobId}/message`

            const resp = await (
                await fetch(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                })
            ).text()

            if (resp !== '"ok"') {
                errorHandler(resp)
                return socket.emit(`browserMessage_${id}`, false)
            }

            log(`Sent to browser session (id = ${jobId}): ${JSON.stringify(message)}`)

            socket.emit(`browserMessage_${id}`, true)
        } catch (err) {
            errorHandler(err)
            socket.emit(`browserMessage_${id}`, false)
        } finally {
        }
    })

    async function stop(jobId) {
        try {
            //TODO : 시작 전에 먼저 종료했을 때 제대로 종료되지 않는 문제 해결
            const url = `http://${process.env.W2S_HOST}:${process.env.W2S_PORT}/api/jobs/${jobId}/stop`

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
        }
    }

    socket.on('stop', async () => {
        try {
            if (!socket._jobId) return

            await stop(socket._jobId)
        } catch (err) {
            errorHandler(err)
        } finally {
            delete socket._jobId
            log('Stopped')
        }
    })

    socket.on('stopBrowser', async (id, jobId) => {
        try {
            if (!browsers[room][jobId]) return socket.emit(`stopBrowser_${id}`, false)

            await stop(jobId)
            typeof browsers[room][jobId] === 'number' && clearTimeout(browsers[room][jobId])
            delete browsers[room][jobId]

            log(`Stopped ${jobId}`)

            socket.emit(`stopBrowser_${id}`, true)
        } catch (err) {
            errorHandler(err)
            socket.emit(`stopBrowser_${id}`, false)
        } finally {
        }
    })

    socket.on('disconnect', async () => {
        try {
            if (socket._jobId) await stop(socket._jobId)

            if (socket.isPreview) return
            else {
                for (let id in streams[room]) {
                    streams[room][id].sender && streams[room][id].sender.close()
                    streams[room][id].receiver && streams[room][id].receiver.close()
                    delete streams[room][id]
                }

                for (let id in browsers[room]) {
                    await stop(id)
                    typeof browsers[room][id] === 'number' && clearTimeout(browsers[room][id])
                    delete browsers[room][id]
                }
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
