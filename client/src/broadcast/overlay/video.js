import React from 'react'
import { Div, Video } from '../../components'
import { Overlay, HexToRGB } from './overlay'
import { OverlayParam, OverlayType } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import Connector from '../../connector'
import BI from '../info'

export class VideoOverlay extends Overlay {
    constructor() {
        super()

        const handleRef = React.createRef()

        this.id = null
        this.sid = null

        this.onMouseUp = (e) => {
            handleRef.current && (handleRef.current.dataset.move = 'false')
        }

        this.children = (props) => {
            let params = this.props.value.params

            let bc = HexToRGB(params.border_color || '#000000')

            let src = params.src

            switch (params.src_type) {
                case OverlayParam.src_type.UPLOAD:
                    // FIXME: upload file url
                    break
                case OverlayParam.src_type.URL:
                    break
                default:
            }

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
                        src={src}
                        autoPlay
                        loop
                        muted
                        controls
                        controlsList='nofullscreen nodownload noremoteplayback'
                        disablePictureInPicture
                        data-muted={true}
                        onLoadedMetadata={(e) => {
                            if (props.isTemp === true) return
                            let conn = Connector.getInstance()
                            conn.registerElement(
                                OverlayType.VIDEO,
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
    }

    componentDidMount() {
        super.componentDidMount()

        window.addEventListener('mouseup', this.onMouseUp)
    }

    componentDidUpdate() {
        super.componentDidUpdate()

        const sid = this.props.isTemp === true ? BI().getTempScene().id : BI().currentScene().id

        if (this.id !== this.props.value.id || sid !== this.sid) {
            this.id = this.props.value.id
            this.sid = sid
        }
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.onMouseUp)
        let conn = Connector.getInstance()
        if (this.props.isTemp === false) conn.unregisterElement(OverlayType.VIDEO, this.props.value.id, this.sid)
    }
}
