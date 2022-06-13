import React from 'react'
import {
    Header,
    Main,
    Div,
    Footer,
    Article,
    Ul,
    CommonProps,
    Li,
    Nav,
    Form,
    P,
    Button,
    Dialog,
} from '../components'
import './index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import Connector from './connector'
import OverlayContainer from './overlay'

class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
            isBroadcasting: false,
        }

        this.workplaceRef = React.createRef()
        this.contextMenuRef = React.createRef()
        this.propertyDialogRef = React.createRef()

        this.getRects = () => {
            const wp = this.workplaceRef.current

            this.setState({
                canvasRect: {
                    height: wp.clientHeight,
                    width: wp.clientWidth,
                },
            })
        }

        this.getCanvasRatio = (size) =>
            (this.state.canvasRect.width / 1920) * size

        this.toggleBroadcast = () => {
            let connector = Connector.getInstance()
            connector.connect()

            if (this.state.isBroadcasting) connector.stop()
            else connector.start()

            this.setState({
                isBroadcasting: !this.state.isBroadcasting,
            })
        }
        this.toggleBroadcast = this.toggleBroadcast.bind(this)
    }

    componentDidMount() {
        window.addEventListener('resize', this.getRects)
        this.getRects()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.getRects)
        let connector = Connector.getInstance()
        connector.disconnect()
    }

    render() {
        return (
            <CommonProps>
                <Header
                    flex
                    fixsize
                    flex-justify='space-between'
                    flex-align='center'
                    border-bottom='normal'
                    height='64'>
                    <Div flex fixsize padding-left='8'>
                        <input type='text' defaultValue='Just Chatting' />
                        <button>수정</button>
                        <button>삭제</button>
                    </Div>
                    <Div fixsize padding-right='8'>
                        <button onClick={this.toggleBroadcast}>
                            {this.state.isBroadcasting
                                ? '방송 종료'
                                : '방송 시작'}
                        </button>
                    </Div>
                </Header>
                <Div flex height='calc(100% - 65px)' width='100%'>
                    <Nav
                        flex
                        flex-direction='column'
                        flex-justify='space-between'
                        fixsize
                        width='256'
                        border-right='normal'>
                        <Ul>
                            <Item
                                selected
                                menu={this.contextMenuRef}
                                propertyDialog={this.propertyDialogRef}>
                                Just Chatting
                            </Item>
                            <Item
                                menu={this.contextMenuRef}
                                propertyDialog={this.propertyDialogRef}>
                                ASMR
                            </Item>
                            <Li
                                padding='8'
                                border-bottom='normal'
                                align='center'
                                cursor='default'>
                                장면 추가
                            </Li>
                        </Ul>
                        <Ul>
                            <Li
                                padding='8'
                                border-top='normal'
                                align='center'
                                cursor='default'>
                                장면 전환 설정
                            </Li>
                        </Ul>
                    </Nav>
                    <Main flex flex-direction='column' width='100%'>
                        <Article
                            position='relative'
                            align='center'
                            background='black'
                            height='calc(100% - 65px)'>
                            <OverlayContainer
                                ratio={this.getCanvasRatio(1)}
                                referrer={this.workplaceRef}
                            />
                        </Article>
                        <Footer
                            flex
                            fixsize
                            flex-justify='space-between'
                            height='64'
                            border-top='normal'>
                            <Div
                                flex
                                flex-direction='column'
                                flex-justify='center'
                                padding-left='8'>
                                <input type='text' defaultValue='방송제목' />
                                <select>
                                    <option>Just Chatting</option>
                                    <option>Art</option>
                                    <option>ASMR</option>
                                </select>
                            </Div>
                            <Div
                                flex
                                flex-direction='column'
                                flex-justify='center'
                                padding-right='8'
                                align='right'>
                                <div>
                                    <FontAwesomeIcon icon={faUserAlt} /> 123
                                </div>
                                <div>12:34:56</div>
                            </Div>
                        </Footer>
                    </Main>
                </Div>
                <PropertyDialog ref={this.propertyDialogRef} />
                <ContextMenu ref={this.contextMenuRef} />
            </CommonProps>
        )
    }
}

class ContextMenu extends React.Component {
    constructor() {
        super()

        this.state = {
            top: 100,
            left: 100,
            target: null,
            open: false,
        }

        this.onClick = () => {
            if (this) {
                this.setState({
                    open: false,
                })
            }
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick)
    }

    show(target, top, left) {
        this.setState({
            top: top,
            left: left,
            target: target,
            open: true,
        })
    }

    render() {
        return (
            <Dialog
                position='fixed'
                top={this.state.top}
                left={this.state.left}
                border='normal'
                background='white'
                open={this.state.open}>
                <Div padding='8' hover='hover' cursor='default'>
                    복제
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    수정
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    삭제
                </Div>
            </Dialog>
        )
    }
}

class Item extends React.Component {
    constructor() {
        super()

        this.onContextMenu = this.onContextMenu.bind(this)
        this.onDblClick = this.onDblClick.bind(this)
    }

    onDblClick(e) {
        if (this.props.propertyDialog) {
            let dialog = this.props.propertyDialog.current
            let top = e.clientY
            let left = e.clientX

            dialog.show(this, top, left)
        }
    }

    onContextMenu(e) {
        e.preventDefault()
        if (this.props.menu) {
            let menu = this.props.menu.current
            let top = e.clientY
            let left = e.clientX

            menu.show(this, top, left)
        }
    }
    render() {
        return (
            <Li
                padding='8'
                border-bottom='normal'
                cursor='default'
                selected={this.props.selected}
                onContextMenu={this.onContextMenu}
                onDoubleClick={this.onDblClick}>
                {this.props.children}
            </Li>
        )
    }
}

class PropertyDialog extends React.Component {
    constructor() {
        super()

        this.state = {
            top: 200,
            left: 200,
            target: null,
            open: false,
        }

        this.onClick = () => {
            if (this) {
                this.setState({
                    open: false,
                })
            }
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick)
    }

    show(target, top, left) {
        this.setState({
            top: top - 8,
            left: left + 8,
            target: target,
            open: true,
        })
    }

    render() {
        return (
            <Dialog
                position='fixed'
                top={this.state.top}
                left={this.state.left}
                border='normal'
                background='white'
                open={this.state.open}>
                <Div
                    display='inline-block'
                    height='0'
                    width='0'
                    arrow='right'
                    position='absolute'
                    top='-1'
                    left='-16'
                    z-index='-1'
                />
                <Form>
                    <Div padding='8'>
                        <P>
                            이름: <input type='text' />
                        </P>
                        <P padding-top='8'>
                            종류:{' '}
                            <select>
                                <option>이미지</option>
                                <option>웹 뷰 (URL)</option>
                            </select>
                        </P>
                    </Div>
                    <Div padding='8' border-top='normal' border-bottom='normal'>
                        <P>
                            파일: <input type='file' />
                        </P>
                    </Div>
                    <Div>
                        <Button width='50%'>저장</Button>
                        <Button width='50%'>취소</Button>
                    </Div>
                </Form>
            </Dialog>
        )
    }
}

export default Broadcast
