import React from 'react'
import { OVERLAY_PROPS } from '.'
import { Div } from '../../components'
import Moveable from 'react-moveable'
import BI from '../info'

export class Overlay extends React.Component {
    state = {
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        rotate: 0,
        sizeBias: 0,
        params: {},
        moveable: false,
    }

    constructor() {
        super()

        this.contentRef = React.createRef()
        this.childrenRef = React.createRef()
        this.moveableRef = React.createRef()

        this.value = {}

        this.children = <></>

        this.isResizing = false

        this.onShift = (e) => {
            if (e.shiftKey) {
                this.setState({
                    aspect_ratio: true,
                })
            }
        }
        this.onShift = this.onShift.bind(this)

        this.offShift = () => {
            this.setState({
                aspect_ratio: false,
            })
        }
        this.offShift = this.offShift.bind(this)

        this.setFocus = () => {
            BI().currentScene().overlay.selected = this.props.idx
            BI().onChange(true)
        }
        this.setFocus = this.setFocus.bind(this)
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
            aspect_ratio: false,
        })

        window.addEventListener('keydown', this.onShift)
        window.addEventListener('keyup', this.offShift)
    }

    componentDidUpdate() {
        this.value = this.props.value

        this.moveableRef.current && this.moveableRef.current.moveable.checkUpdateRect()
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onShift)
        window.removeEventListener('keyup', this.offShift)
    }

    sizeBias() {
        let params = this.props.value.params

        return (parseFloat(params.margin) + parseFloat(params.border_width) + parseFloat(params.padding)) * 2
    }

    // FIXME : 크로마키 지원

    render() {
        return (
            <OVERLAY_PROPS.Consumer>
                {(props) => {
                    let ratio = this.props.ratio || props.ratio || 1
                    let moveable =
                        !(this.props.preview || props.preview) &&
                        BI().currentScene().overlay.selected === this.props.idx &&
                        !props.isTemp
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
                                    isTemp={this.props.isTemp}
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
                                keepRatio={this.state.aspect_ratio || this.props.value.params.aspect_ratio || false}
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

export function HexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null
}
