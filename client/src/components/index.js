import React from 'react'
import classNames from 'classnames'

const COMMON_PROPS = React.createContext()

export default class Component extends React.Component {
    constructor() {
        super()
        this.component = ''

        this.getStyle = () => {
            function concatPx(value) {
                return isNaN(value) ? value : value + 'px'
            }

            let {
                'z-index': zIndex,
                padding,
                'padding-bottom': paddingBottom,
                'padding-top': paddingTop,
                'padding-left': paddingLeft,
                'padding-right': paddingRight,
                margin,
                'margin-bottom': marginBottom,
                'margin-top': marginTop,
                'margin-left': marginLeft,
                'margin-right': marginRight,
                height,
                width,
                top,
                bottom,
                left,
                right,
                style,
                'border-radius': borderRadius,
                'aspect-ratio': aspectRatio,
                'max-height': maxHeight,
                'max-width': maxWidth,
                ...args
            } = this.args

            this.args = args

            return {
                zIndex,
                paddingLeft: concatPx(paddingLeft || padding),
                paddingRight: concatPx(paddingRight || padding),
                paddingTop: concatPx(paddingTop || padding),
                paddingBottom: concatPx(paddingBottom || padding),
                marginLeft: concatPx(marginLeft || margin),
                marginRight: concatPx(marginRight || margin),
                marginTop: concatPx(marginTop || margin),
                marginBottom: concatPx(marginBottom || margin),
                borderRadius: concatPx(borderRadius),
                height: concatPx(height),
                width: concatPx(width),
                top: concatPx(top),
                bottom: concatPx(bottom),
                left: concatPx(left),
                right: concatPx(right),
                aspectRatio,
                maxHeight,
                maxWidth,
                ...style,
            }
        }

        this.getClassName = () => {
            let {
                className,
                flex,
                grid,
                'flex-justify': justify,
                'flex-align': flexAlign,
                direction,
                fixsize,
                float,
                of: componentOf,
                align,
                position,
                border,
                'border-bottom': borderBottom,
                'border-top': borderTop,
                'border-left': borderLeft,
                'border-right': borderRight,
                'vertical-align': verticalAlign,
                background,
                display,
                ...args
            } = this.args

            this.args = args

            return classNames(
                className,
                componentOf,
                flex && 'flex',
                flex && justify && 'flex-justify-' + justify,
                flex && flexAlign && 'flex-align-' + flexAlign,
                flex && direction && 'direction-' + direction,
                fixsize && 'fixsize',
                float && 'float-' + float,
                borderBottom && 'border-' + borderBottom + '-bottom',
                borderTop && 'border-' + borderTop + '-top',
                borderLeft && 'border-' + borderLeft + '-left',
                borderRight && 'border-' + borderRight + '-right',
                border && 'border-' + border,
                align && 'align-' + align,
                position && 'position-' + position,
                background && 'background-' + background,
                display && 'display-' + display,
                verticalAlign && 'align-' + verticalAlign,
                grid && 'grid'
            )
        }
    }

    render() {
        return (
            <COMMON_PROPS.Consumer>
                {(value) => {
                    this.args = { ...this.props, ...value }
                    let { referrer, ...args } = this.args
                    this.args = args
                    return (
                        <this.component
                            ref={referrer}
                            className={this.getClassName()}
                            style={this.getStyle()}
                            {...this.args}>
                            {this.props.children}
                        </this.component>
                    )
                }}
            </COMMON_PROPS.Consumer>
        )
    }
}

export function CommonProps({ children, ...props }) {
    return (
        <COMMON_PROPS.Provider value={props}>{children}</COMMON_PROPS.Provider>
    )
}

export class Header extends Component {
    constructor() {
        super()
        this.component = 'header'
    }
}

export class Aside extends Component {
    constructor() {
        super()
        this.component = 'aside'
    }
}

export class Main extends Component {
    constructor() {
        super()
        this.component = 'main'
    }
}

export class Div extends Component {
    constructor() {
        super()
        this.component = 'div'
    }
}

export class Footer extends Component {
    constructor() {
        super()
        this.component = 'footer'
    }
}

export class Article extends Component {
    constructor() {
        super()
        this.component = 'article'
    }
}

export class Ul extends Component {
    constructor() {
        super()
        this.component = 'ul'
    }
}

export class Ol extends Component {
    constructor() {
        super()
        this.component = 'ol'
    }
}

export class Li extends Component {
    constructor() {
        super()
        this.component = 'li'
    }
}

export class Nav extends Component {
    constructor() {
        super()
        this.component = 'nav'
    }
}

export class Canvas extends Component {
    constructor() {
        super()
        this.component = 'canvas'
    }
}
