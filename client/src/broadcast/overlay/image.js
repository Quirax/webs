import React from 'react'
import { Overlay, HexToRGB } from './overlay'
import { OverlayParam } from '.'

export class ImageOverlay extends Overlay {
    constructor() {
        super()

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
                <img
                    alt=''
                    src={src}
                    ref={props.referrer}
                    style={{
                        height: props.height * props.ratio,
                        width: props.width * props.ratio,
                        opacity: params.opacity,
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
