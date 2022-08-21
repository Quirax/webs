import { isString } from 'lodash'
import { io } from 'socket.io-client'
import { OverlayType } from './overlay'

export default class Connector {
    static instance = null

    constructor() {
        this.isBroadcasting = false
        this.socket = null
        this.display = {}
        this.camera = {}
    }

    static getInstance() {
        console.log(Connector.instance)
        if (Connector.instance === null) Connector.instance = new Connector()
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

        navigator.mediaDevices.getDisplayMedia({ audio: true, video: true }).then(function (stream) {
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

    registerElement(type, id) {
        if (!isString(type) || Object.values(OverlayType).indexOf(type) === -1)
            console.log(isString(type), Object.values(OverlayType).indexOf(type))
        console.log('register', type, id)
    }

    unregisterElement(type, id) {
        if (!isString(type) || Object.values(OverlayType).indexOf(type) === -1)
            console.log(isString(type), Object.values(OverlayType).indexOf(type))
        console.log('unregister', type, id)
    }

    attachDisplayStream(id, cb, reset) {
        if (!this.display[id]) this.display[id] = {}

        let _cb = cb

        if (!_cb) _cb = this.display[id]?.callback
        else this.display[id].callback = _cb

        if (this.display[id]?.available === false) return _cb(this.display[id].stream)

        if (reset === true) {
            this.display[id].stream &&
                this.display[id].stream.getTracks().forEach((mst) => {
                    mst.stop()
                })

            Object.assign(this.display[id], {
                stream: null,
            })
        }

        if (!this.display[id].stream || this.display[id].stream === null) {
            Object.assign(this.display[id], {
                available: false,
            })

            let getMedia = (stream) => {
                _cb(stream)

                this.display[id].stream = stream
                this.display[id].callback = _cb
                this.display[id].available = true
            }

            getMedia = getMedia.bind(this)

            navigator.mediaDevices.getDisplayMedia({ audio: true, video: true }).then(getMedia)
        } else return _cb(this.display[id].stream)
    }

    detachDisplayStream(id) {
        if (!this.display[id]) return

        this.display[id].stream &&
            this.display[id].stream.getTracks().forEach((mst) => {
                mst.stop()
            })
        this.display[id].stream = null
        this.display[id].available = true
    }

    attachCameraStream(id, cb, reset) {
        console.log(this.camera, this.camera[id], id, reset)

        if (!this.camera[id]) this.camera[id] = {}

        let _cb = cb

        if (!_cb) _cb = this.camera[id]?.callback
        else this.camera[id].callback = _cb

        if (this.camera[id]?.available === false) return _cb(this.camera[id].stream)

        if (reset === true) {
            console.log(id)

            this.camera[id].stream &&
                this.camera[id].stream.getTracks().forEach((mst) => {
                    mst.stop()
                })

            Object.assign(this.camera[id], {
                stream: null,
            })
        }

        if (!this.camera[id].stream || this.camera[id].stream === null) {
            Object.assign(this.camera[id], {
                available: false,
            })

            let getMedia = (stream) => {
                _cb(stream)

                this.camera[id].stream = stream
                this.camera[id].callback = _cb
                this.camera[id].available = true

                console.log(this.camera, id)
            }

            getMedia = getMedia.bind(this)

            navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(getMedia)
        } else return _cb(this.camera[id].stream)
    }

    detachCameraStream(id) {
        if (!this.camera[id]) return

        this.camera[id].stream &&
            this.camera[id].stream.getTracks().forEach((mst) => {
                mst.stop()
            })
        this.camera[id].stream = null
        this.camera[id].available = true

        console.log(this.camera, id)
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}
