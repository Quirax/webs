import React from 'react'
import BI, { GenerateID } from '../info'

// HACK : 오버레이 추가
import { TextOverlay } from './text'
import { ShapeOverlay } from './shape'
import { ImageOverlay } from './image'
import { VideoOverlay } from './video'
import { WebcamOverlay, DisplayOverlay, BrowserOverlay } from './stream'
import getTransitionEffect from '../transition'
import { useSpring, animated } from 'react-spring'

export const OVERLAY_PROPS = React.createContext()

// HACK : 오버레이 추가

export const OverlayType = {
    TEXT: 'text',
    SHAPE: 'shape',
    IMAGE: 'image',
    VIDEO: 'video',
    WEBCAM: 'webcam',
    DISPLAY: 'display',
    BROWSER: 'browser',
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
        id: GenerateID(),
        params: {
            background_color: '#FFFFFF',
            background_opacity: 0,
            opacity: 1,
            aspect_ratio: false,
            radius: 0,
            border_color: '#FFFFFF',
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
                font_color: '#FFFFFF',
                font_opacity: 1,
                text_align_horizontal: OverlayParam.text_align_horizontal.LEFT,
                text_align_vertical: OverlayParam.text_align_vertical.TOP,
                text_line_height: 1.5,
            })
            break
        case OverlayType.SHAPE:
            Object.assign(obj.params, {
                shape_type: OverlayParam.shape_type.RECTANGLE,
                background_opacity: 1,
                triangle_position: 50,
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
        case OverlayType.BROWSER:
            Object.assign(obj.params, {
                src: '',
            })
            break
        default:
            throw new Error('Invalid overlay type')
    }

    return obj
}

export default function OverlayContainer(props) {
    const styles = useSpring(
        props.isTemp === true
            ? getTransitionEffect(BI().currentTransition(), {
                  immediate: !props.isTransition,
              }).temp
            : getTransitionEffect(BI().currentTransition(), {
                  immediate: !props.isTransition,
              }).main
    )

    if (!BI().info) return

    console.log(styles)

    const overlayList = props.scene?.overlay || []

    console.log(getTransitionEffect(BI().currentTransition()))

    // TODO: [1] restyle
    return (
        <OVERLAY_PROPS.Provider
            value={{
                ratio: props.ratio,
                preview: props.preview,
                isTemp: props.isTemp,
            }}>
            <animated.div style={styles} ref={props.referrer}>
                <ol>
                    <OverlayElems overlay={overlayList} isTemp={props.isTemp} />
                </ol>
            </animated.div>
        </OVERLAY_PROPS.Provider>
    )
}

function OverlayElems(props) {
    return (
        <>
            {props.overlay.map((v, i) => {
                // HACK : 오버레이 추가

                switch (v.type) {
                    case OverlayType.TEXT:
                        return <TextOverlay key={i} idx={i} value={v} />
                    case OverlayType.SHAPE:
                        return <ShapeOverlay key={i} idx={i} value={v} />
                    case OverlayType.IMAGE:
                        return <ImageOverlay key={i} idx={i} value={v} />
                    case OverlayType.VIDEO:
                        return <VideoOverlay key={i} idx={i} value={v} isTemp={props.isTemp} />
                    case OverlayType.WEBCAM:
                        return <WebcamOverlay key={i} idx={i} value={v} isTemp={props.isTemp} />
                    case OverlayType.DISPLAY:
                        return <DisplayOverlay key={i} idx={i} value={v} isTemp={props.isTemp} />
                    case OverlayType.BROWSER:
                        return (
                            <OVERLAY_PROPS.Consumer key={i}>
                                {({ ratio, preview }) => (
                                    <BrowserOverlay
                                        idx={i}
                                        value={v}
                                        isTemp={props.isTemp}
                                        ratio={ratio}
                                        isPreview={preview}
                                    />
                                )}
                            </OVERLAY_PROPS.Consumer>
                        )

                    default:
                }
                return <></>
            })}
        </>
    )
}
