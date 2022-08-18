import React from 'react'
import { Div, Video } from '../../components'
import { Overlay, HexToRGB } from './overlay'
import { OverlayType } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import Connector from '../connector'

export class WebcamOverlay extends Overlay {
    constructor() {
        super()

        const handleRef = React.createRef()
        const videoRef = React.createRef()
        this.videoRef = videoRef
        this.id = null

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
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
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
                        controls
                        data-muted={true}
                        onClick={(e) => {
                            if (e.target.dataset.muted !== 'true') return
                            e.target.muted = false
                        }}
                        onPause={(e) => {
                            if (e.target.dataset.muted !== 'true') return
                            e.target.dataset.muted = false
                            e.target.play()
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
            this.videoRef.current && (this.videoRef.current.srcObject = stream)
        }

        this.attach = this.attach.bind(this)

        this.overlayType = OverlayType.WEBCAM
    }

    componentDidMount() {
        super.componentDidMount()

        window.addEventListener('mouseup', this.onMouseUp)
        let conn = Connector.getInstance()
        conn.registerElement(this.overlayType, this.props.value.id)

        this.attachStream()
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.onMouseUp)

        let conn = Connector.getInstance()
        conn.unregisterElement(this.overlayType, this.props.value.id)
    }

    componentDidUpdate() {
        super.componentDidUpdate()

        if (this.id !== this.props.value.id) {
            this.attachStream()
            this.id = this.props.value.id
        }
    }

    attachStream() {
        let conn = Connector.getInstance()
        conn.attachCameraStream(this.props.value.id, this.attach)
    }

    detachStream() {
        let conn = Connector.getInstance()
        conn.detachCameraStream(this.props.value.id)
    }
}

export class DisplayOverlay extends WebcamOverlay {
    constructor() {
        super()

        this.overlayType = OverlayType.WEBCAM
    }

    attachStream() {
        let conn = Connector.getInstance()
        conn.attachDisplayStream(this.props.value.id, this.attach)
    }

    detachStream() {
        let conn = Connector.getInstance()
        conn.detachDisplayStream(this.props.value.id)
    }
}