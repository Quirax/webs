import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'
import wrtc from 'wrtc'

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
    socket.on('offer', async (_sdp) => {
        try {
            let pc = new wrtc.RTCPeerConnection()

            socket._pc = pc

            pc.onicecandidate = (e) => {
                socket.emit('candidate', e.candidate)
            }

            pc.oniceconnectionstatechange = (e) => {}

            pc.ontrack = (e) => {
                if (socket._stream) return
                else socket._stream = e.streams[0]

                console.log(socket._stream)
            }

            await pc.setRemoteDescription(_sdp)

            let sdp = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            })
            await pc.setLocalDescription(sdp)

            socket.emit('answer', sdp)
        } catch (err) {
            console.error(err)
            socket.emit('error', err)
        }
    })

    socket.on('candidate', async (candidate) => {
        try {
            let pc = socket._pc
            await pc.addIceCandidate(new wrtc.RTCIceCandidate(candidate))
        } catch (err) {
            console.error(err)
        }
    })

    socket.on('disconnect', () => {
        try {
            let pc = socket._pc
            let stream = socket._stream

            if (pc) {
                pc.close()
                delete socket._pc
            }

            if (stream) {
                delete socket._stream
            }
        } catch (err) {
            console.error(err)
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
