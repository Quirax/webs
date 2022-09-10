import React from 'react'
import BI from '../info'
import { Ol } from '../../components'

// HACK : 오버레이 추가
import { TextOverlay } from './text'
import { ShapeOverlay } from './shape'
import { ImageOverlay } from './image'
import { VideoOverlay } from './video'
import { WebcamOverlay, DisplayOverlay } from './stream'
import getTransitionEffect from '../transition'
import { useSpring, animated } from 'react-spring'
import { CANVAS_RECT } from '../index'

export const OVERLAY_PROPS = React.createContext()

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
        id: Math.random().toString(36).substring(2, 11),
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
            Object.assign(obj.params, {
                src_type: OverlayParam.src_type.URL,
                src: '',
            })
            break
        case OverlayType.VIDEO:
            Object.assign(obj.params, {
                src_type: OverlayParam.src_type.URL,
                src: '',
            })
            break
        case OverlayType.WEBCAM:
        case OverlayType.DISPLAY:
            break
        default:
            throw new Error('Invalid overlay type')
    }

    return obj
}

export default function OverlayContainer(props) {
    const styles = useSpring(
        Object.assign(
            props.isTemp === true
                ? getTransitionEffect(BI().currentTransition()).temp
                : getTransitionEffect(BI().currentTransition()).main,
            {
                immediate: !props.isTransition,
            }
        )
    )

    const overlayList = props.scene.overlay

    return (
        <OVERLAY_PROPS.Provider
            value={{
                ratio: props.ratio,
                preview: props.preview,
            }}>
            <CANVAS_RECT.Consumer>
                {({ width }) => (
                    <animated.div
                        className='overlayContainer'
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            // width: props.preview ? 1920 : width,
                            // display: 'inline-block',
                            // aspectRatio: '16/9',
                            // top: props.preview ? 0 : '50%',
                            // left: props.preview ? 0 : '50%',
                            // transform: !props.preview && 'translate(-50%, -50%)',
                            ...styles,
                        }}
                        ref={props.referrer}>
                        {/* <Div
                            // background='white'
                            position='absolute'
                            width={props.preview ? 1920 : width}
                            // max-height={this.props.preview ? null : '100%'}
                            display='inline-block'
                            aspect-ratio='16/9'
                            top={props.preview ? 0 : '50%'}
                            left={props.preview ? 0 : '50%'}
                            style={
                                props.preview
                                    ? null
                                    : {
                                          transform: 'translate(-50%, -50%)',
                                      }
                            }
                            referrer={props.referrer}> */}
                        <Ol>
                            <OverlayElems overlay={overlayList} />
                        </Ol>
                        {/* </Div> */}
                    </animated.div>
                )}
            </CANVAS_RECT.Consumer>
        </OVERLAY_PROPS.Provider>
    )
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
