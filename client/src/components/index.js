import React from 'react'
import classNames from 'classnames'

const COMMON_PROPS = React.createContext()

export default class Component extends React.Component {
    constructor() {
        super()
        this.component = ''
    }

    getClassName() {
        let {
            className,
            flex,
            'flex-justify': justify,
            'flex-align': flexAlign,
            direction,
            height,
            width,
            fixsize,
            float,
            border,
            of: componentOf,
            'border-bottom': borderBottom,
            'border-top': borderTop,
            'border-left': borderLeft,
            'border-right': borderRight,
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
            align,
            ...args
        } = this.props

        this.args = args

        return classNames(
            className,
            componentOf,
            flex && 'flex',
            flex && justify && 'flex-justify-' + justify,
            flex && flexAlign && 'flex-align-' + flexAlign,
            flex && direction && 'direction-' + direction,
            height && 'height-' + height,
            width && 'width-' + width,
            fixsize && 'fixsize',
            float && 'float-' + float,
            borderBottom && 'border-' + borderBottom + '-bottom',
            borderTop && 'border-' + borderTop + '-top',
            borderLeft && 'border-' + borderLeft + '-left',
            borderRight && 'border-' + borderRight + '-right',
            border && 'border-' + border,
            paddingBottom && 'padding-' + paddingBottom + '-bottom',
            paddingTop && 'padding-' + paddingTop + '-top',
            paddingLeft && 'padding-' + paddingLeft + '-left',
            paddingRight && 'padding-' + paddingRight + '-right',
            padding && 'padding-' + padding,
            align && 'align-' + align
        )
    }

    render() {
        return (
            <COMMON_PROPS.Consumer>
                {(value) => {
                    this.props = { ...this.props, ...value }
                    return (
                        <this.component
                            className={this.getClassName()}
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
        this.component = 'Ul'
    }
}

export class Li extends Component {
    constructor() {
        super()
        this.component = 'Li'
    }
}
