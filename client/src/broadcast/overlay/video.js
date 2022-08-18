import React from 'react'
import { Div, Video } from '../../components'
import { Overlay, HexToRGB } from './overlay'
import { OverlayParam, OverlayType } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import Connector from '../connector'

export class VideoOverlay extends Overlay {
    constructor() {
        super()

        const handleRef = React.createRef()

        this.onMouseUp = (e) => {
            handleRef.current && (handleRef.current.dataset.move = 'false')
            console.log('mouseup', handleRef.current.dataset.move)
        }

        this.children = (props) => {
            let params = this.props.value.params

            let bc = HexToRGB(params.border_color || '#000000')

            let src = params.src

            let video = (
                <Video
                    width='100%'
                    height='100%'
                    alt=''
                    src={src}
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
            )

            let onClick = null

            switch (params.src_type) {
                case OverlayParam.src_type.UPLOAD:
                    // FIXME: upload file url
                    break
                case OverlayParam.src_type.URL:
                    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/
                    let match = src.match(regExp)

                    if (match && match[2].length === 11) {
                        src = `https://www.youtube-nocookie.com/embed/${match[2]}`
                        src += `?autoplay=1&mute=1`
                        src += `&loop=1&playlist=${match[2]}`
                        src += `&controls=1&fs=0&iv_load_policy=3`
                        src += `&enablejsapi=1`

                        video = (
                            <iframe
                                title={`youtube_${match[2]}`}
                                src={src}
                                width='100%'
                                height='100%'
                                allow='autoplay'
                                frameBorder='0'
                                // style={{ pointerEvents: 'none' }}
                            ></iframe>
                        )

                        onClick = (e) => {
                            console.log(props.referrer.current)
                            if (!props.referrer.current) return
                            // props.referrer.current.contentWindow.click = () => {}
                            props.referrer.current.contentWindow.postMessage(
                                JSON.stringify({
                                    event: 'command',
                                    func: 'unMute',
                                    args: Array.prototype.slice.call([]),
                                }),
                                src
                            )
                        }
                    }
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
                    onClick={onClick}
                    onMouseEnter={(e) => {
                        handleRef.current.style.display = 'inline-block'
                    }}
                    onMouseLeave={(e) => {
                        handleRef.current.dataset.handle === 'false' && (handleRef.current.style.display = 'none')
                    }}>
                    {video}
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
        let conn = Connector.getInstance()
        conn.registerElement(OverlayType.VIDEO, this.props.value.id)
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.onMouseUp)
        let conn = Connector.getInstance()
        conn.unregisterElement(OverlayType.VIDEO, this.props.value.id)
    }
}
