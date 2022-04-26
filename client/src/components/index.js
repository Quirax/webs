import React from 'react'
import classNames from 'classnames'

const COMMON_PROPS = React.createContext()

class Component extends React.Component {
    constructor() {
        super()
        this.component = ''
    }

    getClassName() {
        console.log(this.props)

        return classNames(
            this.props.className,
            this.props.of,
            this.props.flex && 'flex',
            this.props.flex &&
                this.props.justify &&
                'justify-' + this.props.justify,
            this.props.flex && this.props.align && 'align-' + this.props.align,
            this.props.flex &&
                this.props.direction &&
                'direction-' + this.props.direction,
            this.props.height && 'height-' + this.props.height,
            this.props.width && 'width-' + this.props.width,
            this.props.fixsize && 'fixsize',
            this.props.float && 'float-' + this.props.float,
            this.props['border-bottom'] &&
                'border-' + this.props['border-bottom'] + '-bottom',
            this.props['border-top'] &&
                'border-' + this.props['border-top'] + '-top',
            this.props['border-left'] &&
                'border-' + this.props['border-left'] + '-left',
            this.props['border-right'] &&
                'border-' + this.props['border-right'] + '-right',
            this.props.border && 'border-' + this.props.border
        )
    }

    render() {
        return (
            <COMMON_PROPS.Consumer>
                {(value) => {
                    this.props = { ...this.props, ...value }
                    return (
                        <this.component className={this.getClassName()}>
                            {this.props.children}
                        </this.component>
                    )
                }}
            </COMMON_PROPS.Consumer>
        )
    }
}

function CommonProps({ children, ...props }) {
    return (
        <COMMON_PROPS.Provider value={props}>{children}</COMMON_PROPS.Provider>
    )
}

class Header extends Component {
    constructor() {
        super()
        this.component = 'header'
    }
}

class Aside extends Component {
    constructor() {
        super()
        this.component = 'aside'
    }
}

class Main extends Component {
    constructor() {
        super()
        this.component = 'main'
    }
}

class Div extends Component {
    constructor() {
        super()
        this.component = 'div'
    }
}

class Footer extends Component {
    constructor() {
        super()
        this.component = 'footer'
    }
}

class Article extends Component {
    constructor() {
        super()
        this.component = 'article'
    }
}

export default Component
export { Header, Aside, Main, Div, Footer, Article, CommonProps }
