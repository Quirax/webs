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
            // RegExp(
            //     `^(https?:\/\/(?:.+.)?${process.env.REACT_APP_BASE_URL}(?::d{1,5})?)`
            // )
            'http://localhost:3000'
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
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})

let clients = {}
let streams = {}

io.on('connect', (socket) => {
    socket.on('offer', async (_sdp) => {
        try {
            let pc = new wrtc.RTCPeerConnection()

            if (clients[socket.id]) clients[socket.id] = pc
            else clients = { ...clients, [socket.id]: pc }

            pc.onicecandidate = (e) => {
                socket.emit('candidate', e.candidate)
            }

            pc.oniceconnectionstatechange = (e) => {}

            pc.ontrack = (e) => {
                if (streams[socket.id]) return
                else streams = { ...streams, [socket.id]: e.streams[0] }

                console.log(streams)
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
            let pc = clients[socket.id]
            await pc.addIceCandidate(new wrtc.RTCIceCandidate(candidate))
        } catch (err) {
            console.error(err)
        }
    })

    socket.on('disconnect', () => {
        try {
            let pc = clients[socket.id]
            let stream = streams[socket.id]

            if (pc) {
                pc.close()
                delete clients[socket.id]
            }

            if (stream) {
                delete streams[socket.id]
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
