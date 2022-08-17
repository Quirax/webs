import React from 'react'
import { Ol, Div, Span, Img, Video } from '../components'
import Moveable from 'react-moveable'
import BI, { assignContainer } from './info'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'
import Connector from './connector'

const OVERLAY_PROPS = React.createContext()

// HACK : 오버레이 추가

export const OverlayType = {
    TEXT: 'text',
    SHAPE: 'shape',
    IMAGE: 'image',
    VIDEO: 'video',
    WEBCAM: 'webcam',
    DISPLAY: 'display',
}

Object.freeze(OverlayType)

export const OverlayParam = {
    overflow: Object.freeze({
        HIDDEN: 'hidden',
        SHOW: 'show',
    }),
    font_flags: Object.freeze({
        BOLD: 'bold',
        ITALIC: 'italic',
        UNDERLINE: 'underline',
        STRIKE: 'strike',
    }),
    text_align_horizontal: Object.freeze({
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right',
        JUSTIFY: 'justify',
    }),
    text_align_vertical: Object.freeze({
        TOP: 'top',
        MIDDLE: 'middle',
        BOTTOM: 'bottom',
    }),
    font_family: Object.freeze({
        /* FIXME: 글꼴 목록 반영 */
    }),
    border_style: Object.freeze({
        NONE: 'none',
        DOTTED: 'dotted',
        DASHED: 'dashed',
        SOLID: 'solid',
        DOUBLE: 'double',
        GROOVE: 'groove',
        RIDGE: 'ridge',
        INSET: 'inset',
        OUTSET: 'outset',
    }),
    shape_type: Object.freeze({
        RECTANGLE: 'rectangle',
        ELLIPSE: 'ellipse',
        TRIANGLE: 'triangle',
    }),
    src_type: Object.freeze({
        UPLOAD: 'upload',
        URL: 'url',
    }),
}

Object.freeze(OverlayParam)

export const OverlayGenerator = (name, type) => {
    let obj = {
        name,
        type,
        params: {
            background_color: '#000000',
            background_opacity: 0,
            opacity: 1,
            aspect_ratio: false,
            radius: 0,
            border_color: '#000000',
            border_opacity: 1,
            border_width: 0,
            border_style: OverlayParam.border_style.SOLID,
            margin: 0,
            padding: 0,
        },
        transform: {
            x: 0,
            y: 0,
            height: 100,
            width: 100,
            rotate: 0,
        },
    }

    // HACK : 오버레이 추가

    const id = Math.random().toString(36).substring(2, 11)

    switch (type) {
        case OverlayType.TEXT:
            Object.assign(obj.params, {
                overflow: OverlayParam.overflow.SHOW,
                text: '',
                // font_family: 'aaa',
                font_size: 12,
                font_flags: {
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                },
                font_color: '#000000',
                font_opacity: 1,
                text_align_horizontal: OverlayParam.text_align_horizontal.LEFT,
                text_align_vertical: OverlayParam.text_align_vertical.TOP,
                text_line_height: 1.5,
            })
            break
        case OverlayType.SHAPE:
            Object.assign(obj.params, {
                shape_type: OverlayParam.shape_type.RECTANGLE,
            })
            break
        case OverlayType.IMAGE:
            Object.assign(obj, {
                id: id,
            })
            Object.assign(obj.params, {
                src_type: OverlayParam.src_type.URL,
                src: '',
            })
            break
        case OverlayType.VIDEO:
            Object.assign(obj, {
                id: id,
            })
            Object.assign(obj.params, {
                src_type: OverlayParam.src_type.URL,
                src: '',
            })
            break
        case OverlayType.WEBCAM:
        case OverlayType.DISPLAY:
            Object.assign(obj, {
                id: id,
            })
            break
        default:
            throw new Error('Invalid overlay type')
    }

    return obj
}

export default class OverlayContainer extends React.Component {
    constructor() {
        super()

        this.state = {
            overlay: BI().currentScene().overlay,
        }

        // this.onResize = (e) => {
        //     this.forceUpdate()
        // }
        // this.onResize = this.onResize.bind(this)

        assignContainer(() => {
            this.forceUpdate()
        })
    }

    componentDidMount() {
        // window.addEventListener('resize', this.onResize)
    }

    render() {
        return (
            <OVERLAY_PROPS.Provider
                value={{
                    ratio: this.props.ratio,
                    preview: this.props.preview,
                }}>
                <Div
                    className='overlayContainer'
                    background='white'
                    position='absolute'
                    width={this.props.preview ? 1920 : '100%'}
                    // max-height={this.props.preview ? null : '100%'}
                    display='inline-block'
                    aspect-ratio='16/9'
                    top={this.props.preview ? 0 : '50%'}
                    left={this.props.preview ? 0 : '50%'}
                    style={
                        this.props.preview
                            ? null
                            : {
                                  transform: 'translate(-50%, -50%)',
                              }
                    }
                    referrer={this.props.referrer}>
                    <Ol>
                        <OverlayElems overlay={this.state.overlay} />
                    </Ol>
                </Div>
            </OVERLAY_PROPS.Provider>
        )
    }
}

function OverlayElems(props) {
    return (
        <>
            {props.overlay.map((v, i) => {
                // HACK : 오버레이 추가

                console.log(v)

                switch (v.type) {
                    case OverlayType.TEXT:
                        return <TextOverlay key={i} value={v} />
                    case OverlayType.SHAPE:
                        return <ShapeOverlay key={i} value={v} />
                    case OverlayType.IMAGE:
                        return <ImageOverlay key={i} value={v} />
                    case OverlayType.VIDEO:
                        return <VideoOverlay key={i} value={v} />
                    case OverlayType.WEBCAM:
                        return <WebcamOverlay key={i} value={v} />
                    case OverlayType.DISPLAY:
                        return <DisplayOverlay key={i} value={v} />
                    default:
                }
                return <></>
            })}
        </>
    )
}

class Overlay extends React.Component {
    constructor() {
        super()

        this.state = {
            x: 0,
            y: 0,
            height: 0,
            width: 0,
            rotate: 0,
            sizeBias: 0,
            params: {},
        }

        this.contentRef = React.createRef()
        this.childrenRef = React.createRef()
        this.moveableRef = React.createRef()

        this.value = {}

        this.children = <></>

        this.isResizing = false
    }

    componentDidMount() {
        this.value = this.props.value

        this.setState({
            x: parseFloat(this.value.transform.x),
            y: parseFloat(this.value.transform.y),
            height: parseFloat(this.value.transform.height),
            width: parseFloat(this.value.transform.width),
            rotate: parseFloat(this.value.transform.rotate),
            params: this.props.value.params,
        })
    }

    componentDidUpdate() {
        this.value = this.props.value

        this.moveableRef.current && this.moveableRef.current.moveable.checkUpdateRect()
    }

    sizeBias() {
        let params = this.props.value.params

        return (parseFloat(params.margin) + parseFloat(params.border_width) + parseFloat(params.padding)) * 2
    }

    render() {
        return (
            <OVERLAY_PROPS.Consumer>
                {(props) => {
                    let ratio = this.props.ratio || props.ratio || 1
                    let moveable = !(this.props.preview || props.preview)
                    let childrenRef = this.childrenRef.current

                    return (
                        <li onMouseDown={this.setFocus}>
                            <Div
                                className='overlay'
                                display='inline-block'
                                position='absolute'
                                referrer={this.contentRef}
                                height={(this.props.value.transform.height + this.sizeBias()) * ratio}
                                width={(this.props.value.transform.width + this.sizeBias()) * ratio}
                                top={this.props.value.transform.y * ratio}
                                left={this.props.value.transform.x * ratio}
                                style={{
                                    transform: `rotate(${this.props.value.transform.rotate}deg)`,
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                }}
                                onMouseUp={(e) => {
                                    e.preventDefault()
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault()
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault()
                                }}>
                                <this.children
                                    referrer={this.childrenRef}
                                    height={this.props.value.transform.height}
                                    width={this.props.value.transform.width}
                                    ratio={ratio}
                                />
                            </Div>
                            <Moveable
                                ref={this.moveableRef}
                                hideDefaultLines={!moveable}
                                target={this.contentRef.current}
                                origin={false}
                                edge={false} //Resize event edges
                                useResizeObserver={true}
                                /* For draggable */
                                draggable={moveable}
                                throttleDrag={0}
                                onDragStart={({ target }) => {
                                    target.style.pointerEvents = 'none'
                                }}
                                onDrag={({ target, left, top }) => {
                                    target.style.left = left + 'px'
                                    target.style.top = top + 'px'

                                    this.value.transform.x = left / ratio
                                    this.value.transform.y = top / ratio

                                    BI().onChange(false)
                                }}
                                onDragEnd={({ target }) => {
                                    target.style.pointerEvents = 'auto'
                                    BI().afterChange()
                                }}
                                /* For resizable */
                                resizable={moveable}
                                keepRatio={false}
                                throttleResize={1}
                                onResizeStart={({ target }) => {
                                    target.style.pointerEvents = 'none'
                                    this.isResizing = true
                                }}
                                onResize={({ target, width, height, drag }) => {
                                    let _height = height / ratio
                                    let _width = width / ratio

                                    let _left = drag.left
                                    let _top = drag.top

                                    target.style.height = height + 'px'
                                    target.style.width = width + 'px'
                                    childrenRef.style.height = `${(_height - this.sizeBias()) * ratio}px`
                                    childrenRef.style.width = `${(_width - this.sizeBias()) * ratio}px`
                                    target.style.left = _left + 'px'
                                    target.style.top = _top + 'px'

                                    this.value.transform.x = _left / ratio
                                    this.value.transform.y = _top / ratio
                                    this.value.transform.height = _height - this.sizeBias()
                                    this.value.transform.width = _width - this.sizeBias()

                                    BI().onChange(false)
                                }}
                                onResizeEnd={({ target }) => {
                                    target.style.pointerEvents = 'auto'
                                    BI().afterChange()
                                }}
                                /* For rotatable */
                                rotatable={moveable}
                                throttleRotate={0}
                                onRotateStart={({ target }) => {
                                    target.style.pointerEvents = 'none'
                                }}
                                onRotate={({ target, transform }) => {
                                    this.value.transform.rotate =
                                        parseFloat(transform.replace('rotate(', '').replace('deg)', '')) % 360
                                    target.style.transform = transform

                                    BI().onChange(false)
                                }}
                                onRotateEnd={({ target }) => {
                                    target.style.pointerEvents = 'auto'
                                    BI().afterChange()
                                }}
                                /* For snappable */
                                snappable={moveable}
                                snapThreshold={16}
                                elementGuidelines={['.overlay']}
                                snapGap={true}
                                isDisplaySnapDigit={false}
                                verticalGuidelines={[0, 1920 * ratio]}
                                horizontalGuidelines={[0, 1080 * ratio]}
                                snapDirections={{
                                    top: true,
                                    right: true,
                                    bottom: true,
                                    left: true,
                                }}
                                elementSnapDirections={{
                                    top: true,
                                    right: true,
                                    bottom: true,
                                    left: true,
                                }}
                            />
                        </li>
                    )
                }}
            </OVERLAY_PROPS.Consumer>
        )
    }
}

function HexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}

// HACK : 오버레이 추가

class TextOverlay extends Overlay {
    constructor() {
        super()

        this.children = (props) => {
            let params = this.props.value.params

            let bgc = HexToRGB(params.background_color || '#000000')
            let bc = HexToRGB(params.border_color || '#000000')
            let c = HexToRGB(params.font_color || '#000000')

            let fj = '',
                ox = ''

            switch (params.text_align_vertical) {
                case OverlayParam.text_align_vertical.TOP:
                    fj = 'start'
                    break
                case OverlayParam.text_align_vertical.MIDDLE:
                    fj = 'center'
                    break
                case OverlayParam.text_align_vertical.BOTTOM:
                    fj = 'end'
                    break
                default:
                    fj = 'start'
            }

            switch (params.overflow) {
                case OverlayParam.overflow.HIDDEN:
                    ox = 'hidden'
                    break
                case OverlayParam.overflow.SHOW:
                    ox = 'visible'
                    break
                default:
            }

            return (
                <Div
                    referrer={props.referrer}
                    flex
                    border='none'
                    height={props.height * props.ratio}
                    width={props.width * props.ratio}
                    flex-direction='column'
                    flex-justify={fj}
                    style={{
                        backgroundColor: `rgba(${bgc.r}, ${bgc.g}, ${bgc.b}, ${params.background_opacity})`,
                        opacity: params.opacity,
                        // TODO: params.aspect_ratio,
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}>
                    <Span
                        style={{
                            // TODO: fontFamily: params.font_family,
                            fontSize: `${params.font_size * props.ratio}pt`, // TODO: 화면 크기가 작을 때 폰트 크기가 너무 작으면 제대로 렌더링되지 않는 문제 해결
                            fontWeight: params.font_flags?.bold ? 'bold' : 'normal',
                            fontStyle: params.font_flags?.italic ? 'italic' : 'normal',
                            textDecoration: [
                                params.font_flags?.underline ? 'underline' : '',
                                params.font_flags?.strike ? 'line-through' : '',
                            ]
                                .join(' ')
                                .trim(),
                            color: `rgba(${c.r}, ${c.g}, ${c.b}, ${params.font_opacity})`,
                            textAlign: params.text_align_horizontal,
                            lineHeight: params.text_line_height,
                            overflow: ox,
                        }}>
                        {params.text.split('\n').map((v, i) => {
                            if (i === 0) return v
                            return (
                                <>
                                    <br key={i} />
                                    {v}
                                </>
                            )
                        })}
                    </Span>
                </Div>
            )
        }
    }
}

class ShapeOverlay extends Overlay {
    constructor() {
        super()

        this.children = (props) => {
            let params = this.props.value.params

            let bgc = HexToRGB(params.background_color || '#000000')
            let bc = HexToRGB(params.border_color || '#000000')
            let bgcs = `rgba(${bgc.r}, ${bgc.g}, ${bgc.b}, ${params.background_opacity})`

            let br = '0px'

            switch (params.shape_type) {
                case OverlayParam.shape_type.RECTANGLE:
                    br = `${params.radius * props.ratio}px`
                    break
                case OverlayParam.shape_type.ELLIPSE:
                    br = '100%'
                    break
                case OverlayParam.shape_type.TRIANGLE:
                    br = '0px'
                    break
                default:
            }

            return (
                <Div
                    referrer={props.referrer}
                    border='none'
                    height={props.height * props.ratio}
                    width={props.width * props.ratio}
                    style={{
                        backgroundColor: params.shape_type !== OverlayParam.shape_type.TRIANGLE && bgcs,
                        backgroundImage:
                            params.shape_type === OverlayParam.shape_type.TRIANGLE &&
                            `linear-gradient(to bottom right, transparent 50%, ${bgcs} 0), linear-gradient(to top right, ${bgcs} 50%, transparent 0)`,
                        backgroundSize:
                            params.shape_type === OverlayParam.shape_type.TRIANGLE &&
                            `${params.triangle_position}% 100%, ${100 - params.triangle_position}% 100%`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'left, right',
                        opacity: params.opacity,
                        // TODO: params.aspect_ratio,
                        borderRadius: br,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth:
                            params.shape_type === OverlayParam.shape_type.TRIANGLE
                                ? '0px'
                                : `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${
                            (params.margin +
                                (params.shape_type === OverlayParam.shape_type.TRIANGLE ? params.border_width : 0)) *
                            props.ratio
                        }px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}></Div>
            )
        }
    }
}

class ImageOverlay extends Overlay {
    constructor() {
        super()

        this.children = (props) => {
            let params = this.props.value.params

            let bc = HexToRGB(params.border_color || '#000000')

            let src = params.src
            switch (params.src_type) {
                case OverlayParam.src_type.UPLOAD:
                    // TODO: upload file url
                    break
                case OverlayParam.src_type.URL:
                    break
                default:
            }

            return (
                <Img
                    alt=''
                    src={src}
                    referrer={props.referrer}
                    border='none'
                    height={props.height * props.ratio}
                    width={props.width * props.ratio}
                    style={{
                        opacity: params.opacity,
                        // TODO: params.aspect_ratio,
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}
                />
            )
        }
    }
}

class VideoOverlay extends Overlay {
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
                    // TODO: upload file url
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
                        // TODO: force to keep ratio of video source
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

class WebcamOverlay extends Overlay {
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
                        // TODO: force to keep ratio of video source
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

class DisplayOverlay extends WebcamOverlay {
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
