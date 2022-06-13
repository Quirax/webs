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

    connect() {
        this.socket = this.socket || io(process.env.REACT_APP_SERVER)
    }

    start() {
        if (this.isBroadcasting) return

        let bootstrap = (socket, stream) => {
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
                bootstrap(my.socket, stream)
                my.isBroadcasting = true
            })
    }

    stop() {
        if (this.isBroadcasting) {
            this.socket.mediaRecorder.stop()
            this.socket.mediaRecorder.stream.getTracks().forEach((mst) => {
                mst.stop()
            })
        }
        this.isBroadcasting = false
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}
