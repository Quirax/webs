import React from 'react'
import classNames from 'classnames'

class Component extends React.Component {
    constructor() {
        super()
        this.component = ''
    }

    getClassName() {
        return classNames(this.props.className, this.props.of)
    }

    render() {
        return (
            <this.component className={this.getClassName()}>
                {this.props.children}
            </this.component>
        )
    }
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

class Flex extends Component {
    constructor() {
        super()
        this.component = 'div'
    }

    getClassName() {
        return classNames('flex', super.getClassName())
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
export { Header, Aside, Main, Flex, Footer, Article }
