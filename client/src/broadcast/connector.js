import { io } from 'socket.io-client'

export default class Connector {
    static instance

    constructor() {
        this.isBroadcasting = false
        this.socket = null
    }

    static getInstance() {
        if (Connector.instance) return Connector.instance
        Connector.instance = new Connector()
        return Connector.instance
    }

    start() {
        if (this.isBroadcasting) return

        let bootstrap = (stream) => {
            let socket = io('http://localhost:8080')

            socket.emit('destination', process.env.REACT_APP_DESTINATION)
            socket.emit('start')

            let mediaRecorder = new MediaRecorder(stream)
            mediaRecorder.start(1000)

            mediaRecorder.onstop = (e) => {}

            mediaRecorder.onpause = (e) => {}

            mediaRecorder.onerror = ({ err }) => {
                console.error(err)
            }

            mediaRecorder.ondataavailable = function (e) {
                socket.emit('stream', e.data)
            }

            socket.mediaRecorder = mediaRecorder

            return socket
        }

        let my = this

        navigator.mediaDevices
            .getDisplayMedia({ audio: true, video: true })
            .then(function (stream) {
                my.socket = bootstrap(stream)
                my.isBroadcasting = true
            })
    }

    stop() {
        if (this.isBroadcasting) {
            this.socket.mediaRecorder.stop()
            this.socket.mediaRecorder.stream.getTracks().forEach((mst) => {
                mst.stop()
            })
            this.socket.disconnect()
        }
        this.isBroadcasting = false
    }
}
