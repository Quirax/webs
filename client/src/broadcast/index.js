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
import Itemlist from './itemlist'

export default class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
            isBroadcasting: false,
        }

        this.workplaceRef = React.createRef()

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
        if (this.props.preview) {
            return (
                <CommonProps>
                    <OverlayContainer
                        ratio={this.getCanvasRatio(1)}
                        referrer={this.workplaceRef}
                        preview
                    />
                </CommonProps>
            )
        }
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
                    <Itemlist
                        list={[
                            {
                                name: '텍스트',
                                selected: true,
                            },
                        ]}
                        mode={Itemlist.OVERLAYS}
                    />
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
            </CommonProps>
        )
    }
}
