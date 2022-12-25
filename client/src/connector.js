import { io } from 'socket.io-client'
import BI from './broadcast/info'
import { OverlayType } from './broadcast/overlay'
import Twitch from './twitch'

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

export default class Connector {
    static instance = null
    static isPreview = false

    constructor() {
        this.isBroadcasting = false
        this.socket = null
        this.stream = {} // scene_objid: stream, available, callback
        this.browser = {} // target_url: jobId

        const attachStream = (oid, scene, cb, reset, streamer) => {
            const id = `${scene}_${oid}`
            console.log(id, this.stream[id])

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

            if (Connector.isPreview === true) return _cb(this.stream[id].stream)

            if (!this.stream[id].stream || this.stream[id].stream === null) {
                if (scene === BI().getTempScene().id) return

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

                            this.socket.emit('streamSenderOffer', {
                                sdp,
                                id,
                            })
                        })
                }

                getMedia = getMedia.bind(this)

                streamer()
                    .then(getMedia)
                    .catch((err) => {
                        console.log('streamer_err', err)
                        Object.assign(this.stream[id], {
                            available: true,
                        })
                    })
            } else return _cb(this.stream[id].stream)
        }

        this.attachDisplayStream = (id, scene, cb, reset) => {
            attachStream(id, scene, cb, reset, () => {
                return new Promise((resolve, reject) => {
                    navigator.mediaDevices.getDisplayMedia({ audio: true, video: true }).then(resolve).catch(reject)
                })
            })
        }

        this.attachCameraStream = (id, scene, cb, reset) => {
            attachStream(id, scene, cb, reset, () => {
                return new Promise((resolve, reject) => {
                    navigator.mediaDevices.getUserMedia({ video: true }).then(resolve).catch(reject)
                })
            })
        }

        this.attachMicStream = (cb, reset) => {
            attachStream('main', 'this', cb, reset, () => {
                return new Promise((resolve, reject) => {
                    navigator.mediaDevices.getUserMedia({ audio: true }).then(resolve).catch(reject)
                })
            })
        }

        function assignBrowser(jobId, url, hls_url) {
            Connector.instance.browser[jobId] = {
                url: url,
                // hls_url: hls_url,
            }
        }

        this.attachBrowser = (oid, scene, url) => {
            if (!scene) return

            return new Promise((resolve) => {
                const browser = Connector.instance.browser
                let jobId = Object.keys(browser).find((key) => browser[key].url === url)

                if (!jobId) {
                    const id = `${scene}_${oid}`
                    this.socket.emit('streamBrowser', id, url)
                    this.socket.once(`streamBrowser_${id}`, (jobId) => {
                        assignBrowser(jobId, url)
                        resolve(jobId)
                    })
                } else {
                    let { hls_url } = browser[jobId]
                    resolve(jobId, hls_url)
                }
            })
        }
    }

    static getInstance() {
        if (Connector.instance === null) Connector.instance = new Connector()
        return Connector.instance
    }

    static setIsPreview(ip) {
        Connector.isPreview = ip
    }

    connect(uid) {
        if (this.socket) return
        if (!uid) {
            return
        }

        this.socket = io(process.env.REACT_APP_SERVER, {
            query: {
                uid,
            },
        })
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

                    console.log(e, id)

                    this.stream[id].callback && this.stream[id].callback(this.stream[id].stream)
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
        console.log(this.socket)
        if (this.socket === null) return
        this.socket.emit('getBroadcastInfo')
        this.socket.on('getBroadcastInfo', (info) => {
            console.log(info)
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

    setDescription(desc) {
        this.socket.emit('setDescription', desc)
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

    async start() {
        if (this.isBroadcasting) return

        const twitch = Twitch.getInstance()

        let key = await twitch.getStreamKey()
        if (!key) return alert('스트림 키를 받을 수 없습니다.')

        this.socket.emit('start', 'rtmp://sel04.contribute.live-video.net/app/' + key)

        this.isBroadcasting = true
    }

    stop() {
        if (this.isBroadcasting) {
            this.socket.emit('stop')
        }
        this.isBroadcasting = false
    }

    registerElement(type, oid, scene, elem) {
        const id = `${scene}_${oid}`
        console.log(id)

        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('registerElement', id)

        if (socket[id]) {
            this.unregisterElement(type, oid, scene)
        }

        socket[id] = {
            isTriggered: false,
            blockPause: false,
            timers: [],
            elem: elem,
            events: {},
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

        // TODO: change into mappers
        switch (type) {
            case OverlayType.DISPLAY:
            case OverlayType.VIDEO:
            case OverlayType.WEBCAM:
            case OverlayType.BROWSER: // TODO: add resolution change callback
                socket.on('event_' + id, async (params) => {
                    const elem = socket[id].elem

                    console.log(id, 'event', params)

                    switch (params.type) {
                        case 'connect':
                            if (!setTriggered()) break
                            elem.currentTime = 0
                            if (!elem.paused) break
                            socket[id].blockPause = true
                            try {
                                await elem.play()
                            } catch (err) {
                                console.log(err)
                                socket[id].isTriggered = false
                            }
                            socket[id].blockPause = false
                            break
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

                socket[id].events = {
                    play: (e) => {
                        console.log(id, 'emit', e)
                        if (!isTriggered(e)) return
                        socket.emit('event_' + id, { type: 'play' })
                    },
                    pause: (e) => {
                        console.log(id, 'emit', e)
                        if (!isTriggered(e)) return
                        const elem = socket[id].elem
                        if (elem.seeking) return
                        socket.emit('event_' + id, { type: 'pause' })
                    },
                    ratechange: (e) => {
                        console.log(id, 'emit', e)
                        const elem = socket[id].elem
                        socket.emit('event_' + id, { type: 'ratechange', rate: elem.playbackRate })
                    },
                    seeking: (e) => {
                        console.log(id, 'emit', e)
                        if (!isTriggered(e)) return
                        const elem = socket[id].elem
                        socket.emit('event_' + id, { type: 'seeking', time: elem.currentTime })
                    },
                    volumechange: (e) => {
                        console.log(id, 'emit', e)
                        if (!e.isTrusted) return
                        const elem = socket[id].elem
                        socket.emit('event_' + id, { type: 'volumechange', volume: elem.volume, muted: elem.muted })
                    },
                }

                for (let e in socket[id].events) {
                    elem.addEventListener(e, socket[id].events[e])
                }
                break
            default:
        }
    }

    unregisterElement(type, oid, scene, force = false) {
        if (scene === BI().currentScene().id && !force) return

        const id = `${scene}_${oid}`
        console.log(id)

        if (this.socket === null) this.connect()
        const socket = this.socket

        socket.emit('unregisterElement', id)

        socket.off('event_' + id)

        if (socket[id]) {
            if (socket[id].timers)
                socket[id].timers.forEach((v) => {
                    clearInterval(v)
                })

            for (let e in socket[id].events) {
                socket[id].elem.removeEventListener(e, socket[id].events[e])
            }

            delete socket[id]
        }
    }

    detachStream(oid, scene) {
        if (Connector.isPreview === true) return

        if (scene === BI().getTempScene().id || scene === BI().currentScene().id) return

        const id = `${scene}_${oid}`

        console.log('detachStream', id, this.stream[id])

        if (!this.stream[id]) return

        if (this.stream[id].available === false) return

        this.stream[id].stream &&
            this.stream[id].stream.getTracks().forEach((t) => {
                t.stop()
            })
        this.stream[id].callback(null)
        this.stream[id].stream = null
        this.stream[id].available = true
        this.stream[id].pc && this.stream[id].pc.close()

        delete this.stream[id]

        this.socket.emit('disconnectStream', id)
    }

    detachMic() {
        this.detachStream('main', 'this')
    }

    messageBrowser = (oid, scene, jobId, message) => {
        const conn = Connector.instance
        if (!conn.browser[jobId]) throw new Error(`No browser instance for jobId "${jobId}" found`)

        const id = `${scene}_${oid}`

        if (message.cmd === 'goto') {
            conn.browser[jobId].url = message.url
        }

        this.socket.emit('browserMessage', id, jobId, message)
    }

    detachBrowser = (oid, scene, jobId) => {
        const conn = Connector.instance
        return new Promise((resolve, reject) => {
            if (!conn.browser[jobId]) return reject(`No browser instance for jobId "${jobId}" found`)

            const id = `${scene}_${oid}`
            this.socket.emit('stopBrowser', id, jobId)
            this.socket.once(`stopBrowser_${id}`, (result) => {
                if (result !== true) return reject(`Failed to stop browser instance for jobId "${jobId}"`)

                delete conn.browser[jobId]
                resolve()
            })
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}
