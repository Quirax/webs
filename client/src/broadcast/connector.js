import { io } from 'socket.io-client'
import BI from './info'
import { OverlayType } from './overlay'

const wrtc_cfg = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
            // credential: 'webrtc',
            // username: 'webrtc',
        },
    ],
}

export default class Connector {
    static instance = null
    static isPreview = false

    constructor() {
        this.isBroadcasting = false
        this.socket = null
        this.stream = {}

        const attachStream = (id, cb, reset, streamer) => {
            if (!this.stream[id]) this.stream[id] = {}

            let _cb = cb

            if (!_cb) _cb = this.stream[id]?.callback
            else this.stream[id].callback = _cb

            if (this.stream[id]?.available === false) return _cb(this.stream[id].stream)

            if (reset === true) {
                this.stream[id].stream &&
                    this.stream[id].stream.getTracks().forEach((mst) => {
                        mst.stop()
                    })

                Object.assign(this.stream[id], {
                    stream: null,
                })
            }

            if (Connector.isPreview) return

            if (!this.stream[id].stream || this.stream[id].stream === null) {
                Object.assign(this.stream[id], {
                    available: false,
                })

                let getMedia = (stream) => {
                    this.stream[id].stream = stream
                    this.stream[id].callback = _cb

                    //sendPC = createSenderPeerConnection(newSocket, localStream);
                    this.stream[id].pc = new RTCPeerConnection(wrtc_cfg)

                    this.stream[id].pc.onicecandidate = (e) => {
                        if (!e.candidate) return
                        this.socket.emit('streamSenderCandidate', {
                            candidate: e.candidate,
                            id,
                        })
                    }

                    this.stream[id].pc.oniceconnectionstatechange = (e) => {
                        console.log('sender_oniceconnectionstatechange', e)
                    }

                    stream.getTracks().forEach((track) => {
                        this.stream[id].pc.addTrack(track, stream)
                    })

                    //createSenderOffer(newSocket);
                    this.stream[id].pc
                        .createOffer({
                            offerToReceiveAudio: false,
                            offerToReceiveVideo: false,
                        })
                        .then(async (sdp) => {
                            await this.stream[id].pc.setLocalDescription(new RTCSessionDescription(sdp))

                            console.log(this.stream[id].pc, sdp)

                            this.socket.emit('streamSenderOffer', {
                                sdp,
                                id,
                            })
                        })
                }

                getMedia = getMedia.bind(this)

                streamer(getMedia)
                console.log(this.stream[id])
            } else return _cb(this.stream[id].stream)
        }

        this.attachDisplayStream = (id, cb, reset) => {
            attachStream(id, cb, reset, (cb) => {
                navigator.mediaDevices.getDisplayMedia({ audio: true, video: true }).then(cb)
            })
        }

        this.attachCameraStream = (id, cb, reset) => {
            attachStream(id, cb, reset, (cb) => {
                navigator.mediaDevices.getUserMedia({ video: true }).then(cb)
            })
        }
    }

    static getInstance() {
        console.log(Connector.instance)
        if (Connector.instance === null) Connector.instance = new Connector()
        return Connector.instance
    }

    static setIsPreview(ip) {
        Connector.isPreview = ip
    }

    connect() {
        if (this.socket) return
        this.socket = io(process.env.REACT_APP_SERVER)
        this.socket.emit('isPreview', Connector.isPreview)

        this.socket.on('streamConnect', async (data) => {
            console.log(data)
            // createReceivePC(data.id, newSocket);
            const id = data.id

            if (!this.stream[id]) this.stream[id] = {}

            try {
                // let pc = createReceiverPeerConnection(id, newSocket)
                this.stream[id].pc = new RTCPeerConnection(wrtc_cfg)

                this.stream[id].pc.onicecandidate = (e) => {
                    if (!e.candidate) return
                    this.socket.emit('streamReceiverCandidate', {
                        candidate: e.candidate,
                        id,
                    })
                }

                this.stream[id].pc.oniceconnectionstatechange = (e) => {
                    console.log('receiver_oniceconnectionstatechange', e)
                }

                this.stream[id].pc.ontrack = (e) => {
                    this.stream[id].stream = e.streams[0]

                    console.log(e)

                    this.stream[id].callback(this.stream[id].stream)
                    this.stream[id].available = true
                }

                // createReceiverOffer(pc, newSocket, id)
                let sdp = await this.stream[id].pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                })
                await this.stream[id].pc.setLocalDescription(new RTCSessionDescription(sdp))

                console.log(this.stream[id].pc, sdp)

                this.socket.emit('streamReceiverOffer', {
                    sdp,
                    id,
                })
            } catch (error) {
                console.log(error)
            }
        })

        this.socket.on('streamClosed', (data) => {
            this.stream[data.id].pc.close()
            delete this.stream[data.id].pc
        })

        this.socket.on('streamSenderAnswer', async (data) => {
            try {
                console.log('streamSenderAnswer', data)
                await this.stream[data.id].pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                this.stream[data.id].callback(this.stream[data.id].stream)
                this.stream[data.id].available = true
            } catch (error) {
                console.log(error)
            }
        })

        this.socket.on('streamSenderCandidate', async (data) => {
            try {
                console.log('streamSenderCandidate', data)
                if (!data.candidate) return
                await this.stream[data.id].pc.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (error) {
                console.log(error)
            }
        })

        this.socket.on('streamReceiverAnswer', async (data) => {
            try {
                console.log('streamReceiverAnswer', data)
                await this.stream[data.id].pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
            } catch (error) {
                console.log(error)
            }
        })

        this.socket.on('streamReceiverCandidate', async (data) => {
            try {
                console.log('streamReceiverCandidate', data)
                if (!data.candidate) return
                await this.stream[data.id].pc.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (error) {
                console.log(error)
            }
        })
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
        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('registerElement', id)

        if (socket[id]) return

        socket[id] = {
            isTriggered: false,
            blockPause: false,
            timers: [],
            elem: elem,
        }

        function isTriggered(e) {
            if (!e.isTrusted) return false
            if (socket[id].isTriggered !== true) return true
            socket[id].isTriggered = false
            return false
        }

        function setTriggered() {
            if (socket[id].isTriggered === true) return false
            socket[id].isTriggered = true
            return true
        }

        switch (type) {
            case OverlayType.DISPLAY:
            case OverlayType.VIDEO:
            case OverlayType.WEBCAM:
                socket.on('event_' + id, async (params) => {
                    const elem = socket[id].elem

                    switch (params.type) {
                        case 'play':
                            if (!elem.paused) break
                            if (!setTriggered()) break
                            socket[id].blockPause = true
                            try {
                                await elem.play()
                            } catch (err) {
                                socket[id].isTriggered = false
                            }
                            socket[id].blockPause = false
                            break
                        case 'pause':
                            if (elem.paused) break
                            if (socket[id].blockPause === true) {
                                socket[id].isTriggered = false
                                break
                            }
                            socket[id].isTriggered = true
                            elem.pause()
                            break
                        case 'ratechange':
                            elem.playbackRate = params.rate
                            break
                        case 'seeking':
                            if (!setTriggered()) break
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
                    if (!isTriggered(e)) return
                    socket.emit('event_' + id, { type: 'play' })
                })
                elem.addEventListener('pause', (e) => {
                    if (!isTriggered(e)) return
                    const elem = socket[id].elem
                    if (elem.seeking) return
                    socket.emit('event_' + id, { type: 'pause' })
                })
                elem.addEventListener('ratechange', (e) => {
                    const elem = socket[id].elem
                    socket.emit('event_' + id, { type: 'ratechange', rate: elem.playbackRate })
                })
                elem.addEventListener('seeking', (e) => {
                    if (!isTriggered(e)) return
                    const elem = socket[id].elem
                    socket.emit('event_' + id, { type: 'seeking', time: elem.currentTime })
                })
                elem.addEventListener('volumechange', (e) => {
                    if (!e.isTrusted) return
                    const elem = socket[id].elem
                    socket.emit('event_' + id, { type: 'volumechange', volume: elem.volume, muted: elem.muted })
                })
                break
            default:
        }
    }

    unregisterElement(type, id) {
        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('unregisterElement', id)

        socket.off('event_' + id)

        if (socket[id]) {
            if (socket[id].timers)
                socket[id].timers.forEach((v) => {
                    clearInterval(v)
                })

            delete socket[id]
        }
    }

    detachStream(id) {
        if (!this.stream[id]) return

        this.stream[id].stream &&
            this.stream[id].stream.getTracks().forEach((mst) => {
                mst.stop()
            })
        this.stream[id].stream = null
        this.stream[id].available = true
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}
