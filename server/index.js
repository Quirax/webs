import Express from 'express'
import { spawn } from 'child_process'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { Server } from 'socket.io'

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

io.on('connect', (socket) => {
    socket.emit('message', 'Client-to-Server Message')
    socket.on('message', (message) => {
        console.log(message)
    })
})

let port = process.env.PORT || 8080
server.listen(port, () => {
    console.info(`HTTPS and WebSocket is listening on ${port}`)
})

process.on('uncaughtException', (e) => {
    console.error(e)
})
