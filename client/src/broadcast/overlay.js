import React from 'react'
import {
    Header,
    Ol,
    Main,
    Div,
    Footer,
    Article,
    Ul,
    CommonProps,
    Li,
    Nav,
    Form,
    P,
    Button,
    Dialog,
} from '../components'
import Moveable from 'react-moveable'

const OVERLAY_PROPS = React.createContext()

export default class OverlayContainer extends React.Component {
    constructor() {
        super()
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
                        <Overlay
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
                        </Overlay>
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
                        <Overlay
                            top='400'
                            left='400'
                            height='16'
                            width='480'
                            rotate='0'>
                            <span>Lorem ipsum 로렘 입숨</span>
                        </Overlay>
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
            enableMoveable: false,
        }

        this.contentRef = React.createRef()

        this.x = 0
        this.y = 0
    }

    componentDidMount() {
        this.x = parseFloat(this.props.left)
        this.y = parseFloat(this.props.top)

        this.setState({
            x: this.x,
            y: this.y,
            height: parseFloat(this.props.height),
            width: parseFloat(this.props.width),
            rotate: parseFloat(this.props.rotate),
        })

        setTimeout(
            (t) => {
                t.setState({
                    enableMoveable: true,
                })
            },
            1,
            this
        )
    }

    render() {
        return (
            <OVERLAY_PROPS.Consumer>
                {(value) => {
                    let ratio = this.props.ratio || value.ratio || 1
                    let preview = this.props.preview || value.preview

                    return (
                        <li>
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
                                {this.props.children}
                            </Div>
                            {(() => {
                                if (preview) return <></>
                                return (
                                    <Moveable
                                        hideDefaultLines={
                                            !this.state.enableMoveable
                                        }
                                        target={this.contentRef.current}
                                        origin={false}
                                        edge={false} //Resize event edges
                                        useResizeObserver={true}
                                        /* For draggable */
                                        draggable={this.state.enableMoveable}
                                        throttleDrag={0}
                                        onDrag={({ target, left, top }) => {
                                            target.style.left = left + 'px'
                                            target.style.top = top + 'px'

                                            this.x = left / ratio
                                            this.y = top / ratio
                                        }}
                                        onDragEnd={() => {
                                            this.setState({
                                                x: this.x,
                                                y: this.y,
                                            })
                                        }}
                                        /* For resizable */
                                        resizable={this.state.enableMoveable}
                                        keepRatio={false}
                                        throttleResize={1}
                                        onResizeStart={({ dragStart }) => {
                                            dragStart &&
                                                dragStart.set([
                                                    this.state.x * ratio,
                                                    this.state.y * ratio,
                                                ])
                                        }}
                                        onResize={({
                                            target,
                                            width,
                                            height,
                                            drag,
                                        }) => {
                                            let _height = height / ratio
                                            let _width = width / ratio

                                            target.style.height = height + 'px'
                                            target.style.width = width + 'px'
                                            target.style.left =
                                                drag.beforeTranslate[0] + 'px'
                                            target.style.top =
                                                drag.beforeTranslate[1] + 'px'

                                            this.x =
                                                drag.beforeTranslate[0] / ratio
                                            this.y =
                                                drag.beforeTranslate[1] / ratio

                                            this.setState({
                                                height: _height,
                                                width: _width,
                                            })
                                        }}
                                        onResizeEnd={() => {
                                            this.setState({
                                                x: this.x,
                                                y: this.y,
                                            })
                                        }}
                                        /* For rotatable */
                                        rotatable={this.state.enableMoveable}
                                        throttleRotate={0}
                                        onRotate={({ target, transform }) => {
                                            this.setState({
                                                rotate: parseFloat(
                                                    transform
                                                        .replace('rotate(', '')
                                                        .replace('deg)', '')
                                                ),
                                            })
                                            target.style.transform = transform
                                        }}
                                        /* For snappable */
                                        snappable={this.state.enableMoveable}
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
                                )
                            })()}
                        </li>
                    )
                }}
            </OVERLAY_PROPS.Consumer>
        )
    }
}
