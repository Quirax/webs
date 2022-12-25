import React from 'react'
import { Overlay, HexToRGB } from './overlay'
import { OverlayType } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import Connector from '../../connector'
import BI from '../info'
import ReactHlsPlayer from 'react-hls-player'

export class WebcamOverlay extends Overlay {
    constructor() {
        super()

        const handleRef = React.createRef()
        const videoRef = React.createRef()
        this.videoRef = videoRef
        this.id = null
        this.sid = null

        this.onMouseUp = (e) => {
            handleRef.current && (handleRef.current.dataset.move = 'false')
            console.log('mouseup', handleRef.current.dataset.move)
        }

        this.children = (props) => {
            let params = this.props.value.params

            let bc = HexToRGB(params.border_color || '#000000')

            // let src = params.src

            return (
                <div
                    style={{
                        opacity: params.opacity,
                        // FIXME: force to keep ratio of video source
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                        height: props.height * props.ratio,
                        width: props.width * props.ratio,
                    }}
                    ref={props.referrer}
                    onMouseEnter={(e) => {
                        if (props.isPreview) return
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
                        if (props.isPreview) return
                        handleRef.current.dataset.handle === 'false' && (handleRef.current.style.display = 'none')
                    }}>
                    <video
                        width='100%'
                        height='100%'
                        alt=''
                        // srcObject={this.state.stream}
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        controls={false}
                        data-muted={true}
                        onClick={(e) => {
                            if (e.target.dataset.muted !== 'true') return
                            e.target.muted = false
                        }}
                        onLoadedMetadata={(e) => {
                            if (props.isTemp === true) return
                            let conn = Connector.getInstance()
                            conn.registerElement(
                                this.overlayType,
                                this.props.value.id,
                                BI().currentScene().id,
                                e.target
                            )
                        }}
                    />
                    <div
                        ref={handleRef}
                        className='video-handle'
                        data-handle='false'
                        data-move='false'
                        onMouseEnter={(e) => {
                            handleRef.current.dataset.handle = 'true'
                        }}
                        onMouseDown={(e) => {
                            handleRef.current.dataset.move = 'true'
                            console.log('mousedown', handleRef.current.dataset.move)
                        }}
                        onMouseLeave={(e) => {
                            handleRef.current.dataset.move === 'false' && (handleRef.current.dataset.handle = 'false')
                        }}>
                        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
                    </div>
                </div>
            )
        }

        this.attach = (stream) => {
            console.log(stream, this.videoRef.current)
            this.videoRef.current && (this.videoRef.current.srcObject = stream)
        }

        this.attach = this.attach.bind(this)

        this.overlayType = OverlayType.WEBCAM
    }

    componentDidMount() {
        super.componentDidMount()

        window.addEventListener('mouseup', this.onMouseUp)

        if (!this.props.isTemp) this.attachStream()
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.onMouseUp)

        let conn = Connector.getInstance()
        if (this.props.isTemp === false) {
            conn.unregisterElement(this.overlayType, this.props.value.id, this.sid)
            this.detachStream()
        }
    }

    componentDidUpdate() {
        super.componentDidUpdate()

        const sid = this.props.isTemp === true ? BI().getTempScene().id : BI().currentScene().id

        if (this.id !== this.props.value.id || sid !== this.sid) {
            this.id = this.props.value.id
            this.sid = sid
            this.detachStream()
            this.attachStream()
        }
    }

    attachStream() {
        let conn = Connector.getInstance()
        this.attach(null)
        conn.attachCameraStream(this.props.value.id, this.sid, this.attach)
    }

    detachStream() {
        let conn = Connector.getInstance()
        console.log(this.props.value.id, this.sid)
        conn.detachStream(this.props.value.id, this.sid)
    }
}

export class DisplayOverlay extends WebcamOverlay {
    constructor() {
        super()

        this.overlayType = OverlayType.DISPLAY
    }

    attachStream() {
        let conn = Connector.getInstance()
        this.attach(null)
        conn.attachDisplayStream(
            this.props.value.id,
            this.props.isTemp === true ? BI().getTempScene().id : BI().currentScene().id,
            this.attach
        )
    }
}

export class BrowserOverlay extends WebcamOverlay {
    state = {
        src: '',
    }

    constructor() {
        super()

        const handleRef = React.createRef()
        const videoRef = React.createRef()
        this.videoRef = videoRef
        this.id = null
        this.sid = null

        this.onMouseUp = (e) => {
            handleRef.current && (handleRef.current.dataset.move = 'false')
            console.log('mouseup', handleRef.current.dataset.move)
        }

        this.children = (props) => {
            let params = this.props.value.params

            let bc = HexToRGB(params.border_color || '#000000')

            // let src = params.src

            return (
                <div
                    style={{
                        opacity: params.opacity,
                        // FIXME: force to keep ratio of video source
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                        height: props.height * props.ratio,
                        width: props.width * props.ratio,
                        backgroundColor: !props.isPreview && 'white',
                    }}
                    ref={props.referrer}
                    onMouseEnter={(e) => {
                        if (props.isPreview) return
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
                        if (props.isPreview) return
                        handleRef.current.dataset.handle === 'false' && (handleRef.current.style.display = 'none')
                    }}>
                    {props.isPreview && (
                        <ReactHlsPlayer
                            width='100%'
                            height='100%'
                            alt=''
                            src={this.state.src}
                            playerRef={videoRef}
                            autoPlay={true}
                            loop
                            controls={false}
                            hlsConfig={{
                                maxLoadingDelay: 4,
                                minAutoBitrate: 0,
                                lowLatencyMode: true,
                            }}
                            style={{
                                // position: 'absolute',
                                // minWidth: '100%',
                                // minHeight: '100%',
                                // top: '50%',
                                // left: '50%',
                                // transform: 'translate(-50%, -50%)',
                                objectFit: 'fill',
                            }}
                            data-muted={true}
                            onClick={(e) => {
                                if (e.target.dataset.muted !== 'true') return
                                e.target.muted = false
                            }}
                            onLoadedMetadata={(e) => {
                                if (props.isTemp === true) return
                                let conn = Connector.getInstance()
                                console.log('unregisterBrowser')
                                conn.unregisterElement(
                                    this.overlayType,
                                    this.props.value.id,
                                    BI().currentScene().id,
                                    true
                                )
                                console.log('registerBrowser')
                                conn.registerElement(
                                    this.overlayType,
                                    this.props.value.id,
                                    BI().currentScene().id,
                                    e.target
                                )
                                e.target.currentTime = e.target.duration - 2
                            }}
                        />
                    )}
                    <div
                        ref={handleRef}
                        className='video-handle'
                        data-handle='false'
                        data-move='false'
                        onMouseEnter={(e) => {
                            handleRef.current.dataset.handle = 'true'
                        }}
                        onMouseDown={(e) => {
                            handleRef.current.dataset.move = 'true'
                            console.log('mousedown', handleRef.current.dataset.move)
                        }}
                        onMouseLeave={(e) => {
                            handleRef.current.dataset.move === 'false' && (handleRef.current.dataset.handle = 'false')
                        }}>
                        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
                    </div>
                </div>
            )
        }

        this.overlayType = OverlayType.BROWSER

        this.url = 'about:blank'

        this.jobId = -1

        this.attach = (jobId) => {
            if (jobId === '') return

            const hls_url = `${process.env.REACT_APP_SERVER}/hls/${jobId}/playlist.m3u8`
            console.log(jobId, hls_url)
            this.jobId = jobId

            this.setState({
                src: hls_url,
            })
        }
    }

    componentDidUpdate() {
        super.componentDidUpdate()

        let conn = Connector.getInstance()

        if (this.jobId !== -1) {
            if (this.url !== '' && this.url !== this.props.value.params.src) {
                this.url = this.props.value.params.src
                conn.messageBrowser(this.props.value.id, this.sid, this.jobId, { cmd: 'goto', url: this.url })
            }

            let ratio = this.props.ratio || 1

            this.videoRef.current &&
                conn.messageBrowser(this.props.value.id, this.sid, this.jobId, {
                    cmd: 'viewport',
                    height: Math.floor(this.videoRef.current.clientHeight / ratio),
                    width: Math.floor(this.videoRef.current.clientWidth / ratio),
                })
        }
    }

    attachStream() {
        if (!this.props.isPreview) return

        let conn = Connector.getInstance()
        this.attach('')
        if (this.url === '') return
        conn.attachBrowser(this.props.value.id, this.sid, this.url)?.then((jobId) => this.attach(jobId))
    }

    detachStream() {
        if (!this.props.isPreview) return

        let conn = Connector.getInstance()
        console.log(this.props.value.id, this.sid, this.jobId)
        if (this.jobId === -1) return
        conn.detachBrowser(this.props.value.id, this.sid, this.jobId)?.then(
            () => this.attach(''),
            (err) => console.log(err)
        )
    }
}
