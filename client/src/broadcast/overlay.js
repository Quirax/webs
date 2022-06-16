import React from 'react'
import { Ol, Div } from '../components'
import Moveable from 'react-moveable'
import BI from './info'

const OVERLAY_PROPS = React.createContext()

export const OverlayType = {
    TEXT: 'text',
}

Object.freeze(OverlayType)

export default class OverlayContainer extends React.Component {
    constructor() {
        super()

        this.state = {
            overlay: [],
        }
    }

    componentDidMount() {
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
        }

        this.contentRef = React.createRef()

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
        })
    }

    componentWillUnmount() {
        //
    }

    render() {
        return (
            <OVERLAY_PROPS.Consumer>
                {(props) => {
                    let ratio = this.props.ratio || props.ratio || 1
                    let moveable = !(this.props.preview || props.preview)

                    return (
                        <li onMouseDown={this.setFocus}>
                            <Div
                                className='overlay'
                                display='inline-block'
                                position='absolute'
                                referrer={this.contentRef}
                                height={this.state.height * ratio}
                                width={this.state.width * ratio}
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
                                {this.children}
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

                                    BI().onChange()
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
                                    dragStart &&
                                        dragStart.set([
                                            this.state.x * ratio,
                                            this.state.y * ratio,
                                        ])
                                }}
                                onResize={({ target, width, height, drag }) => {
                                    let _height = height / ratio
                                    let _width = width / ratio

                                    target.style.height = height + 'px'
                                    target.style.width = width + 'px'
                                    target.style.left =
                                        drag.beforeTranslate[0] + 'px'
                                    target.style.top =
                                        drag.beforeTranslate[1] + 'px'

                                    this.value.transform.x =
                                        drag.beforeTranslate[0] / ratio
                                    this.value.transform.y =
                                        drag.beforeTranslate[1] / ratio
                                    this.value.transform.height = _height
                                    this.value.transform.width = _width

                                    BI().onChange()
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
                                        parseFloat(
                                            transform
                                                .replace('rotate(', '')
                                                .replace('deg)', '')
                                        ) % 360
                                    target.style.transform = transform

                                    BI().onChange()
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

class TextOverlay extends Overlay {
    constructor() {
        super()
    }

    componentDidMount() {
        super.componentDidMount()

        let value = this.props.value
        this.children = <span>{value.params.text}</span>
    }
}
