import React from 'react'
import { Div, Span } from '../../components'
import { Overlay, HexToRGB } from './overlay'
import { OverlayParam } from '.'

export class TextOverlay extends Overlay {
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
                        borderRadius: `${params.radius * props.ratio}px`,
                        borderColor: `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${params.border_opacity})`,
                        borderWidth: `${params.border_width * props.ratio}px`,
                        borderStyle: params.border_style,
                        margin: `${params.margin * props.ratio}px`,
                        padding: `${params.padding * props.ratio}px`,
                    }}>
                    <Span
                        style={{
                            // FIXME: fontFamily: params.font_family,
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
