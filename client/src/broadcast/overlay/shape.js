import React from 'react'
import { Div } from '../../components'
import { Overlay, HexToRGB } from './overlay'
import { OverlayParam } from '.'

export class ShapeOverlay extends Overlay {
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
