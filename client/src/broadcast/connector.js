import { io } from 'socket.io-client'
import BI from './info'
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

    getBroadcastInfo() {
        if (this.socket === null) this.connect()
        this.socket.emit('getBroadcastInfo')
        this.socket.on('getBroadcastInfo', (info) => {
            BI().setInfo(info)
        })
        this.socket.on('selectScene', (idx) => {
            BI().selectScene(idx)
        })
    }

    selectScene(idx) {
        if (this.socket === null) this.connect()
        this.socket.emit('selectScene', idx)
    }

    onChange() {
        if (!BI().info) return
        if (this.socket === null) this.connect()
        this.socket.emit('onChange', BI().info)
    }

    afterChange() {
        if (!BI().info) return
        if (this.socket === null) this.connect()
        this.socket.emit('afterChange', BI().info)
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

    registerElement(type, id, elem) {
        // if (!isString(type) || Object.values(OverlayType).indexOf(type) === -1)
        //     console.log(isString(type), Object.values(OverlayType).indexOf(type))
        // console.log('register', type, id)
        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('registerElement', id)

        switch (type) {
            case OverlayType.DISPLAY:
            case OverlayType.VIDEO:
            case OverlayType.WEBCAM:
                socket.isTriggered = false
                socket.on('event_' + id, async (params) => {
                    switch (params.type) {
                        case 'play':
                            if (socket.isTriggered) return
                            socket.isTriggered = true
                            socket.blockPause = true
                            await elem.play()
                            socket.blockPause = false
                            break
                        case 'pause':
                            if (socket.isTriggered) return
                            socket.isTriggered = true
                            if (socket.blockPause === true) break
                            elem.pause()
                            break
                        case 'ratechange':
                            if (socket.isTriggered) return
                            socket.isTriggered = true
                            elem.playbackRate = params.rate
                            break
                        case 'seeking':
                            if (socket.isTriggered) return
                            socket.isTriggered = true
                            elem.currentTime = params.time
                            break
                        case 'volumechange':
                            elem.volume = params.volume
                            elem.muted = params.muted
                            break
                        default:
                    }
                })

                elem.addEventListener('play', (e) => {
                    if (!e.isTrusted) return
                    if (socket.isTriggered === true) {
                        socket.isTriggered = false
                        return
                    }
                    socket.emit('event_' + id, { type: 'play' })
                })
                elem.addEventListener('pause', (e) => {
                    if (!e.isTrusted) return
                    if (socket.isTriggered === true) {
                        socket.isTriggered = false
                        return
                    }
                    socket.emit('event_' + id, { type: 'pause' })
                })
                elem.addEventListener('ratechange', (e) => {
                    if (!e.isTrusted) return
                    if (socket.isTriggered === true) {
                        socket.isTriggered = false
                        return
                    }
                    socket.emit('event_' + id, { type: 'ratechange', rate: elem.playbackRate })
                })
                elem.addEventListener('seeking', (e) => {
                    if (!e.isTrusted) return
                    if (socket.isTriggered === true) {
                        socket.isTriggered = false
                        return
                    }
                    socket.emit('event_' + id, { type: 'seeking', time: elem.currentTime })
                })
                elem.addEventListener('volumechange', (e) => {
                    if (!e.isTrusted) return
                    socket.emit('event_' + id, { type: 'volumechange', volume: elem.volume, muted: elem.muted })
                })
                // elem.addEventListener('playing', (e) => {
                //     if (!e.isTrusted) return
                //     socket.emit('event_' + id, { type: 'play' })
                // })
                // elem.addEventListener('waiting', (e) => {
                //     if (!e.isTrusted) return
                //     socket.emit('event_' + id, { type: 'pause' })
                // })
                elem.dataset.clicked = 'false'
                break
            default:
        }
    }

    unregisterElement(type, id) {
        // if (!isString(type) || Object.values(OverlayType).indexOf(type) === -1)
        //     console.log(isString(type), Object.values(OverlayType).indexOf(type))
        // console.log('unregister', type, id)
        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('unregisterElement', id)

        socket.off('event_' + id)
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
