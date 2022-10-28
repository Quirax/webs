import React from 'react'
import { Div, Video } from '../../components'
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
                <Div
                    style={{
                        opacity: params.opacity,
                        // FIXME: force to keep ratio of video source
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}
                    width={props.width * props.ratio}
                    height={props.height * props.ratio}
                    referrer={props.referrer}
                    onMouseEnter={(e) => {
                        if (props.isPreview) return
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
                        if (props.isPreview) return
                        handleRef.current.dataset.handle === 'false' && (handleRef.current.style.display = 'none')
                    }}>
                    <Video
                        width='100%'
                        height='100%'
                        alt=''
                        // srcObject={this.state.stream}
                        referrer={videoRef}
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
                    <Div
                        referrer={handleRef}
                        position='absolute'
                        top='16'
                        left='16'
                        display='none'
                        background='white'
                        padding='16'
                        border-radius='8'
                        border='normal'
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
                    </Div>
                </Div>
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
                <Div
                    style={{
                        opacity: params.opacity,
                        // FIXME: force to keep ratio of video source
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}
                    width={props.width * props.ratio}
                    height={props.height * props.ratio}
                    referrer={props.referrer}
                    onMouseEnter={(e) => {
                        if (props.isPreview) return
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
                        if (props.isPreview) return
                        handleRef.current.dataset.handle === 'false' && (handleRef.current.style.display = 'none')
                    }}>
                    <ReactHlsPlayer
                        width='100%'
                        height='100%'
                        alt=''
                        src={this.state.src}
                        playerRef={videoRef}
                        autoPlay={true}
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
                    <Div
                        referrer={handleRef}
                        position='absolute'
                        top='16'
                        left='16'
                        display='none'
                        background='white'
                        padding='16'
                        border-radius='8'
                        border='normal'
                        data-handle='false'
                        data-move='false'
                        onMouseEnter={(e) => {
                            handleRef.current.dataset.handle = 'true'
                        }}
                        onMouseDown={(e) => {
                            handleRef.current.dataset.move = 'true'
                            console.log('mousedown', handleRef.current?.dataset.move)
                        }}
                        onMouseLeave={(e) => {
                            handleRef.current.dataset.move === 'false' && (handleRef.current.dataset.handle = 'false')
                        }}>
                        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
                    </Div>
                </Div>
            )
        }

        this.overlayType = OverlayType.BROWSER

        this.url = 'https://twip.kr/widgets/alertbox/g64oGmrzpq' // TODO: make it blank

        this.attach = (url) => {
            this.setState({
                src: url,
            })
        }
    }

    componentDidUpdate() {
        super.componentDidUpdate()

        // TODO: use broadcast value
        // if (this.url !== this.props.value.src) {
        //     this.url = this.props.value.src
        //     this.detachStream()
        //     this.attachStream()
        // }
    }

    attachStream() {
        let conn = Connector.getInstance()
        this.attach('')
        conn.attachBrowser(this.props.value.id, this.sid, this.url)?.then((hls_url) => this.attach(hls_url)) // TODO: assign to video ref
    }

    detachStream() {
        let conn = Connector.getInstance()
        console.log(this.props.value.id, this.sid)
        conn.detachBrowser(this.props.value.id, this.sid, this.url)?.then(
            () => this.attach(''),
            (err) => console.log(err)
        )
    }
}
