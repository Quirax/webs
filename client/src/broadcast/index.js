import React from 'react'
import {
    Header,
    Ol,
    Main,
    Div,
    Footer,
    Article,
    Ul,
    CommonProps,
    Li,
    Nav,
    Canvas,
    Form,
    P,
    Button,
    Dialog,
} from '../components'
import './index.scss'
import Moveable from 'react-moveable'

class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
        }

        this.canvasRef = React.createRef()
        this.contextMenuRef = React.createRef()
        this.propertyDialogRef = React.createRef()

        this.getRects = () => {
            const canvas = this.canvasRef.current

            this.setState({
                canvasRect: {
                    height: canvas.clientHeight,
                    width: canvas.clientWidth,
                },
            })
        }

        this.getCanvasRatio = (size) =>
            (this.state.canvasRect.width / 1920) * size
    }

    componentDidMount() {
        window.addEventListener('resize', this.getRects)
        this.getRects()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.getRects)
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
                        <button>방송 시작</button>
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
                            <Div
                                className='overlayContainer'
                                background='white'
                                position='absolute'
                                width='100%'
                                max-height='100%'
                                display='inline-block'
                                aspect-ratio='16/9'
                                top='50%'
                                left='50%'
                                style={{
                                    transform: 'translate(-50%, -50%)',
                                }}
                                referrer={this.canvasRef}>
                                <Ol>
                                    <Overlay
                                        top='100'
                                        left='100'
                                        height='200'
                                        width='200'
                                        rotate='0'
                                        ratio={this.getCanvasRatio(1)}>
                                        <img
                                            alt=''
                                            src='logo192.png'
                                            height='100%'
                                            width='100%'
                                        />
                                    </Overlay>
                                </Ol>
                                <Canvas
                                    position='absolute'
                                    height='100%'
                                    width='100%'
                                    z-index='-1'
                                    top='0'
                                    left='0'
                                />
                            </Div>
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
                                <div>[] 123</div>
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

class Overlay extends React.Component {
    constructor() {
        super()

        this.state = {
            x: 0,
            y: 0,
            height: 0,
            width: 0,
            rotate: 0,
            enableMoveable: false,
        }

        this.contentRef = React.createRef()
    }

    componentDidMount() {
        this.setState({
            x: parseFloat(this.props.left),
            y: parseFloat(this.props.top),
            height: parseFloat(this.props.height),
            width: parseFloat(this.props.width),
            rotate: parseFloat(this.props.rotate),
        })

        setTimeout(
            (t) => {
                t.setState({
                    enableMoveable: true,
                })
            },
            1,
            this
        )
    }

    render() {
        let ratio = this.props.ratio || 1

        return (
            <li>
                <Div
                    className='overlay'
                    display='inline-block'
                    position='absolute'
                    referrer={this.contentRef}
                    height={this.state.height * ratio}
                    width={this.state.width * ratio}
                    top={this.state.y * ratio}
                    left={this.state.x * ratio}
                    style={{
                        transform: `rotate(${this.state.rotate}deg)`,
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault()
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault()
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault()
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault()
                    }}>
                    {this.props.children}
                </Div>
                <Moveable
                    hideDefaultLines={!this.state.enableMoveable}
                    target={this.contentRef.current}
                    origin={false}
                    edge={false} //Resize event edges
                    useResizeObserver={true}
                    /* For draggable */
                    draggable={this.state.enableMoveable}
                    throttleDrag={0}
                    onDrag={({ target, left, top }) => {
                        target.style.left = left + 'px'
                        target.style.top = top + 'px'

                        this.setState({
                            x: left / ratio,
                            y: top / ratio,
                        })
                    }}
                    /* For resizable */
                    resizable={this.state.enableMoveable}
                    keepRatio={false}
                    throttleResize={1}
                    onResizeStart={({ dragStart }) => {
                        dragStart &&
                            dragStart.set([
                                this.state.x * ratio,
                                this.state.y * ratio,
                            ])
                    }}
                    onResize={({ target, width, height, drag }) => {
                        let _height = height / ratio
                        let _width = width / ratio

                        target.style.height = height + 'px'
                        target.style.width = width + 'px'
                        target.style.left = drag.beforeTranslate[0] + 'px'
                        target.style.top = drag.beforeTranslate[1] + 'px'

                        this.setState({
                            height: _height,
                            width: _width,
                            x: drag.beforeTranslate[0] / ratio,
                            y: drag.beforeTranslate[1] / ratio,
                        })
                    }}
                    /* For rotatable */
                    rotatable={this.state.enableMoveable}
                    throttleRotate={0}
                    onRotate={({ target, transform }) => {
                        this.setState({
                            rotate: parseFloat(
                                transform
                                    .replace('rotate(', '')
                                    .replace('deg)', '')
                            ),
                        })
                        target.style.transform = transform
                    }}
                    /* For snappable */
                    snappable={this.state.enableMoveable}
                    snapThreshold={16}
                    elementGuidelines={['.overlay']}
                    snapGap={true}
                    isDisplaySnapDigit={false}
                    verticalGuidelines={[0, 1920 * ratio]}
                    horizontalGuidelines={[0, 1080 * ratio]}
                    snapDirections={{
                        top: true,
                        right: true,
                        bottom: true,
                        left: true,
                    }}
                    elementSnapDirections={{
                        top: true,
                        right: true,
                        bottom: true,
                        left: true,
                    }}
                />
            </li>
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
