import React from 'react'
import { Ol, Div, Span } from '../components'
import Moveable from 'react-moveable'
import BI from './info'

const OVERLAY_PROPS = React.createContext()

export const OverlayType = {
    TEXT: 'text',
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
        /* TODO: 글꼴 목록 반영 */
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
}

Object.freeze(OverlayParam)

export default class OverlayContainer extends React.Component {
    constructor() {
        super()

        this.state = {
            overlay: [],
        }
    }

    componentDidMount() {
        BI().assignContainer(this)

        this.setState({
            overlay: BI().currentScene().overlay,
        })
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
                    max-height={this.props.preview ? null : '100%'}
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
                        {this.state.overlay.map((v, i) => {
                            switch (v.type) {
                                case OverlayType.TEXT:
                                    return <TextOverlay key={i} value={v} />
                                default:
                            }
                            return <></>
                        })}
                        {/* <Overlay
                            top='100'
                            left='100'
                            height='332'
                            width='332'
                            rotate='0'>
                            <img
                                alt=''
                                src='https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg'
                                height='100%'
                                width='100%'
                            />
                        </Overlay>
                        <Overlay
                            top='200'
                            left='200'
                            height='180'
                            width='320'
                            rotate='0'>
                            <video
                                src='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
                                height='100%'
                                width='100%'
                                autoPlay
                                loop
                            />
                        </Overlay> */}
                        {/* <Overlay
                            top='300'
                            left='300'
                            height='100'
                            width='180'
                            rotate='0'>
                            <audio
                                src='https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'
                                height='100%'
                                width='100%'
                            />
                        </Overlay> */}
                    </Ol>
                </Div>
            </OVERLAY_PROPS.Provider>
        )
    }
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

        this.value = {}

        this.children = <></>
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
                                height={(this.state.height + this.sizeBias()) * ratio}
                                width={(this.state.width + this.sizeBias()) * ratio}
                                top={this.state.y * ratio}
                                left={this.state.x * ratio}
                                style={{
                                    transform: `rotate(${this.state.rotate}deg)`,
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
                                    height={this.state.height}
                                    width={this.state.width}
                                    ratio={ratio}
                                />
                            </Div>
                            <Moveable
                                hideDefaultLines={!moveable}
                                target={this.contentRef.current}
                                origin={false}
                                edge={false} //Resize event edges
                                useResizeObserver={true}
                                /* For draggable */
                                draggable={moveable}
                                throttleDrag={0}
                                onDrag={({ target, left, top }) => {
                                    target.style.left = left + 'px'
                                    target.style.top = top + 'px'

                                    this.value.transform.x = left / ratio
                                    this.value.transform.y = top / ratio

                                    BI().onChange(false)
                                }}
                                onDragEnd={() => {
                                    this.setState({
                                        x: this.value.transform.x,
                                        y: this.value.transform.y,
                                    })

                                    BI().afterChange()
                                }}
                                /* For resizable */
                                resizable={moveable}
                                keepRatio={false}
                                throttleResize={1}
                                onResizeStart={({ dragStart }) => {
                                    dragStart && dragStart.set([this.state.x * ratio, this.state.y * ratio])
                                }}
                                onResize={({ target, width, height, drag }) => {
                                    let _height = height / ratio
                                    let _width = width / ratio

                                    target.style.height = height + 'px'
                                    target.style.width = width + 'px'
                                    childrenRef.style.height = `${(_height - this.sizeBias()) * ratio}px`
                                    childrenRef.style.width = `${(_width - this.sizeBias()) * ratio}px`
                                    target.style.left = drag.beforeTranslate[0] + 'px'
                                    target.style.top = drag.beforeTranslate[1] + 'px'

                                    this.value.transform.x = drag.beforeTranslate[0] / ratio
                                    this.value.transform.y = drag.beforeTranslate[1] / ratio
                                    this.value.transform.height = _height - this.sizeBias()
                                    this.value.transform.width = _width - this.sizeBias()

                                    BI().onChange(false)
                                }}
                                onResizeEnd={() => {
                                    this.setState({
                                        height: this.value.transform.height,
                                        width: this.value.transform.width,
                                        x: this.value.transform.x,
                                        y: this.value.transform.y,
                                    })

                                    BI().afterChange()
                                }}
                                /* For rotatable */
                                rotatable={moveable}
                                throttleRotate={0}
                                onRotate={({ target, transform }) => {
                                    this.value.transform.rotate =
                                        parseFloat(transform.replace('rotate(', '').replace('deg)', '')) % 360
                                    target.style.transform = transform

                                    BI().onChange(false)
                                }}
                                onRotateEnd={() => {
                                    this.setState({
                                        rotate: this.value.transform.rotate,
                                    })

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
                            fontSize: `${params.font_size * props.ratio}pt`,
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
