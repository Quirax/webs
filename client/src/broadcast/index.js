import React from 'react'
import { Header, Main, Div, Footer, Article, CommonProps } from '../components'
import './index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import Connector from './connector'
import OverlayContainer from './overlay'
import Itemlist, { ItemlistType } from './itemlist'
import BI, { assignTitle, assignContainer } from './info'

export default class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
            isBroadcasting: false,
            mode: ItemlistType.SCENES,
        }

        this.workplaceRef = React.createRef()
        this.tempWorkplaceRef = React.createRef()

        this.getRects = () => {
            const wp = this.workplaceRef.current
            const twp = this.tempWorkplaceRef.current

            if (wp.clientWidth > wp.parentElement.clientWidth) {
                wp.style.width = '100%'
                wp.style.height = null
                twp.style.width = '100%'
                twp.style.height = null
            }
            if (wp.clientHeight > wp.parentElement.clientHeight) {
                wp.style.height = '100%'
                wp.style.width = null
                twp.style.height = '100%'
                twp.style.width = null
            }

            this.setState({
                canvasRect: {
                    height: wp.clientHeight,
                    width: wp.clientWidth,
                },
            })
        }

        this.getCanvasRatio = (size) => (this.state.canvasRect.width / 1920) * size

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

        this.changeMode = (mode) => {
            BI().afterChange()
            this.setState({
                mode: mode,
            })
        }
        this.changeMode = this.changeMode.bind(this)

        this.saveScene = () => {
            this.changeMode(ItemlistType.SCENES)
        }
        this.saveScene = this.saveScene.bind(this)
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
                    <OverlayContainer ratio={this.getCanvasRatio(1)} referrer={this.workplaceRef} preview />
                </CommonProps>
            )
        }
        return (
            <CommonProps>
                <Toolbar
                    saveScene={this.saveScene}
                    toggleBroadcast={this.toggleBroadcast}
                    isBroadcasting={this.state.isBroadcasting}
                    mode={this.state.mode}
                />
                <Div flex height='calc(100% - 65px)' width='100%'>
                    <Itemlist mode={this.state.mode} changeMode={this.changeMode} />
                    <Main flex flex-direction='column' width='100%'>
                        <Containers
                            ratio={this.getCanvasRatio(1)}
                            referrer={this.workplaceRef}
                            tempReferrer={this.tempWorkplaceRef}
                        />
                        <Footer flex fixsize flex-justify='space-between' height='64' border-top='normal'>
                            <Div flex flex-direction='column' flex-justify='center' padding-left='8'>
                                {/* FIXME: 방송 시 방송 세팅과 동기화 */}
                                {/* TODO: 장면 수정 시 기본 방송 세팅과 동기화 */}
                                <input type='text' defaultValue='방송제목' />
                                <select>
                                    <option>Just Chatting</option>
                                    <option>Art</option>
                                    <option>ASMR</option>
                                </select>
                            </Div>
                            <Div flex flex-direction='column' flex-justify='center' padding-right='8' align='right'>
                                {/* FIXME: 방송 시 방송 통계와 동기화 */}
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

class Containers extends React.Component {
    constructor() {
        super()

        assignContainer(() => {
            this.forceUpdate()
        })
    }

    render() {
        return (
            <Article position='relative' align='center' background='black' height='calc(100% - 65px)'>
                <OverlayContainer
                    scene={BI().getTempScene()}
                    ratio={this.props.ratio}
                    referrer={this.props.tempReferrer}
                    isTemp={true}
                />
                <OverlayContainer scene={BI().currentScene()} ratio={this.props.ratio} referrer={this.props.referrer} />
            </Article>
        )
    }
}

class Toolbar extends React.Component {
    constructor() {
        super()

        assignTitle(() => {
            this.forceUpdate()
        })
    }

    render() {
        let currentScene = <></>

        switch (this.props.mode) {
            case ItemlistType.SCENES:
                currentScene = <h1>{BI().currentScene().name}</h1>
                break
            case ItemlistType.TRANSITIONS:
                currentScene = <h1>화면 전환</h1>
                break
            case ItemlistType.OVERLAYS:
                currentScene = (
                    <>
                        <input
                            type='text'
                            defaultValue={BI().currentScene().name}
                            onChange={(e) => {
                                BI().currentScene().name = e.target.value
                            }}
                        />
                        <button onClick={this.props.saveScene}>저장</button>
                        <button
                            onClick={() => {
                                if (BI().info.scene.length === 1) return alert('최소 1개 이상의 장면이 있어야 합니다.')
                                BI().info.scene.splice(BI().info.scene.indexOf(BI().currentScene()), 1)
                                BI().selectScene(0)
                            }}>
                            삭제
                        </button>
                    </>
                )
                break
            default:
                throw new Error('Invalid itemlist mode')
        }

        return (
            <Header flex fixsize flex-justify='space-between' flex-align='center' border-bottom='normal' height='64'>
                <Div flex fixsize padding-left='8'>
                    {currentScene}
                </Div>
                <Div fixsize padding-right='8'>
                    <button onClick={this.props.toggleBroadcast}>
                        {this.props.isBroadcasting ? '방송 종료' : '방송 시작'}
                    </button>
                </Div>
            </Header>
        )
    }
}
