import React from 'react'
import classNames from 'classnames'
import TextareaAutosize from 'react-textarea-autosize'

const COMMON_PROPS = React.createContext()

export default class Component extends React.Component {
    constructor() {
        super()
        this.component = ''

        this.state = {
            noMaxHeight: false,
        }

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
                'text-decoration': textDecoration,
                'flex-justify': justifyContent,
                'flex-align': alignItems,
                'flex-direction': flexDirection,
                align: textAlign,
                float,
                position,
                cursor,
                ...args
            } = this.args

            this.args = args

            return Object.assign(
                {
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
                    maxWidth,
                    textDecoration,
                    justifyContent,
                    alignItems,
                    flexDirection,
                    float,
                    position,
                    cursor,
                    ...style,
                },
                this.state.noMaxHeight ? null : { maxHeight: maxHeight }
            )
        }

        this.getClassName = () => {
            let {
                className,
                flex,
                grid,
                fixsize,
                of: componentOf,
                align,
                border,
                'border-bottom': borderBottom,
                'border-top': borderTop,
                'border-left': borderLeft,
                'border-right': borderRight,
                'vertical-align': verticalAlign,
                background,
                display,
                'inline-block': inlineBlock,
                table,
                arrow,
                hover,
                selected,
                ...args
            } = this.args

            this.args = args

            return classNames(
                className,
                componentOf,
                inlineBlock && 'inline-block',
                table && 'table',
                grid && 'grid',
                flex && 'flex',
                fixsize && 'fixsize',
                borderBottom && 'border-' + borderBottom + '-bottom',
                borderTop && 'border-' + borderTop + '-top',
                borderLeft && 'border-' + borderLeft + '-left',
                borderRight && 'border-' + borderRight + '-right',
                border && 'border-' + border,
                background && 'background-' + background,
                align && 'align-' + align,
                verticalAlign && 'align-' + verticalAlign,
                arrow && 'arrow-' + arrow,
                hover && 'hover-' + (hover || 'hover'),
                selected && 'background-selected',
                display && display
            )
        }
    }

    // TODO: Redesign
    render() {
        return (
            <COMMON_PROPS.Consumer>
                {(value) => {
                    let Cpnt = this.state.component || this.component

                    this.args = { ...this.args, ...this.props, ...value }
                    let { referrer, ...args } = this.args
                    this.args = args
                    return (
                        <Cpnt ref={referrer} className={this.getClassName()} style={this.getStyle()} {...this.args}>
                            {this.props.children}
                        </Cpnt>
                    )
                }}
            </COMMON_PROPS.Consumer>
        )
    }
}

export function CommonProps({ children, ...props }) {
    return <COMMON_PROPS.Provider value={props}>{children}</COMMON_PROPS.Provider>
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

export class Menu extends Component {
    constructor() {
        super()
        this.component = 'menu'
    }
}

export class Span extends Component {
    constructor() {
        super()
        this.component = 'span'
    }
}

export class Form extends Component {
    constructor() {
        super()
        this.component = 'form'
        this.args = {
            onSubmit: (e) => {
                e.preventDefault()
                return false
            },
            onAbort: (e) => {
                e.preventDefault()
                return false
            },
        }
        // return <form on
    }
}

export class P extends Component {
    constructor() {
        super()
        this.component = 'p'
    }
}

export class Button extends Component {
    constructor() {
        super()
        this.component = 'button'
    }
}

export class Dialog extends Component {
    constructor() {
        super()
        this.component = 'dialog'
    }
}

export class Details extends Component {
    constructor() {
        super()
        this.component = 'details'
    }
}

export class Summary extends Component {
    constructor() {
        super()
        this.component = 'summary'
    }
}

export class TD extends Component {
    constructor() {
        super()
        this.component = 'td'
    }
}

export class TR extends Component {
    constructor() {
        super()
        this.component = 'tr'
    }
}

export class Input extends Component {
    constructor() {
        super()
        this.component = 'input'
    }
}

export class Label extends Component {
    constructor() {
        super()
        this.component = 'label'
    }
}

export class Textarea extends Component {
    constructor() {
        super()
        this.component = 'textarea'
    }

    componentDidMount() {
        if (this.props.autoresize) {
            this.setState({
                component: (props) => <TextareaAutosize maxRows={props.maxrows} minRows={props.minrows} {...props} />,
                noMaxHeight: true,
            })
        }
    }
}

export class Table extends Component {
    constructor() {
        super()
        this.component = 'table'
    }
}

export class Img extends Component {
    constructor() {
        super()
        this.component = 'img'
    }
}

export class Video extends Component {
    constructor() {
        super()
        this.component = 'video'
    }
}
