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
} from '../components'
import './index.scss'

class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
        }

        this.canvasRef = React.createRef()

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
            <CommonProps of='broadcast'>
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
                        direction='column'
                        flex-justify='space-between'
                        fixsize
                        width='256'
                        border-right='normal'>
                        <Ul>
                            <Li padding='8' border-bottom='normal'>
                                목록 1
                            </Li>
                            <Li padding='8' border-bottom='normal'>
                                목록 2
                            </Li>
                            <Li padding='8' border-bottom='normal'>
                                목록 3
                            </Li>
                        </Ul>
                        <Ul>
                            <Li padding='8' border-top='normal'>
                                목록 4
                            </Li>
                        </Ul>
                    </Nav>
                    <Main flex direction='column' width='100%'>
                        <Article
                            position='relative'
                            align='center'
                            background='black'
                            height='calc(100% - 65px)'>
                            <Div
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
                                        ratio={this.getCanvasRatio(1)}>
                                        <img
                                            alt='oc-00000001'
                                            src='logo192.png'
                                            height='200'
                                            width='200'
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
                                direction='column'
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
                                direction='column'
                                flex-justify='center'
                                padding-right='8'
                                align='right'>
                                <div>[] 123</div>
                                <div>12:34:56</div>
                            </Div>
                        </Footer>
                    </Main>
                </Div>
            </CommonProps>
        )
    }
}

class Overlay extends React.Component {
    constructor() {
        super()

        this.ResizeHandle = ({ ...props }) => (
            <Li
                height='0'
                width='0'
                padding='5'
                border='normal'
                border-radius='5'
                position='absolute'
                left={props.left}
                top={props.top}
                bottom={props.bottom}
                right={props.right}
                margin='-6'
                background='white'
            />
        )
    }

    render() {
        let ratio = this.props.ratio || 1

        return (
            <Li
                position='absolute'
                margin='-6'
                top={this.props.top * ratio || '0'}
                left={this.props.left * ratio || '0'}
                border={this.props.border || 'normal'}
                height={this.props.height * ratio}
                width={this.props.width * ratio}
                padding='5'
                style={{
                    transform: `rotate(${0}deg)`,
                }}>
                <Div
                    display='inline-block'
                    referrer={this.contentRef}
                    height={this.props.height}
                    width={this.props.width}
                    style={{
                        transform: `scale(${ratio})`,
                        transformOrigin: '0 0',
                    }}>
                    {this.props.children}
                </Div>
                <Div
                    border-left='normal'
                    width='0'
                    height='50'
                    position='absolute'
                    left='50%'
                    top='-50'
                    margin='-1'>
                    {/* Rotate Handler */}
                </Div>
                <ul>
                    <this.ResizeHandle left='0' top='0' />
                    <this.ResizeHandle left='0' top='50%' />
                    <this.ResizeHandle left='0' bottom='0' />
                    <this.ResizeHandle left='50%' bottom='0' />
                    <this.ResizeHandle right='0' bottom='0' />
                    <this.ResizeHandle right='0' bottom='50%' />
                    <this.ResizeHandle right='0' top='0' />
                    <this.ResizeHandle right='50%' top='0' />
                </ul>
            </Li>
        )
    }
}

export default Broadcast
