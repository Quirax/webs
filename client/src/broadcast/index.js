import React from 'react'
import { Header, Main, Div, Footer, Article, CommonProps } from '../components'
import './index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt } from '@fortawesome/free-solid-svg-icons'
import Connector from './connector'
import OverlayContainer from './overlay'
import Itemlist, { ItemlistType } from './itemlist'
import BI, { assignTitle, assignContainer } from './info'

export const CANVAS_RECT = React.createContext({ width: 1920, height: 1080 })

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
            if (this.props.preview)
                return this.setState({
                    canvasRect: {
                        height: 1080,
                        width: 1920,
                    },
                })

            const wp = this.workplaceRef.current

            // if (wp.clientWidth > wp.parentElement.clientWidth) {
            wp.style.width = '100%'
            wp.style.height = null
            // }
            if (wp.clientHeight > wp.parentElement.clientHeight) {
                wp.style.height = '100%'
                wp.style.width = null
            }

            this.setState({
                canvasRect: {
                    height: wp.clientHeight,
                    width: wp.clientWidth,
                },
            })
            BI().onChange()
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
            BI().currentScene().overlay.selected = null
            this.changeMode(ItemlistType.SCENES)
        }
        this.saveScene = this.saveScene.bind(this)
    }

    componentDidMount() {
        let connector = Connector.getInstance()
        Connector.setIsPreview(this.props.preview)
        connector.connect()
        connector.getBroadcastInfo()

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
                    <Containers
                        ratio={this.getCanvasRatio(1)}
                        referrer={this.workplaceRef}
                        tempReferrer={this.tempWorkplaceRef}
                        preview
                    />
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
                        <Article
                            position='relative'
                            align='center'
                            height='calc(100% - 65px)'
                            style={{
                                overflow: 'hidden',
                                backgroundColor: 'gray',
                            }}>
                            <CANVAS_RECT.Provider value={this.state.canvasRect}>
                                <Containers
                                    ratio={this.getCanvasRatio(1)}
                                    referrer={this.workplaceRef}
                                    preview={this.props.preview}
                                />
                            </CANVAS_RECT.Provider>
                        </Article>
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
    state = { isTransition: false }

    constructor() {
        super()

        assignContainer((selectingScene) => {
            this.setState({
                isTransition: selectingScene === true,
            })
        })
    }

    render() {
        return (
            <CANVAS_RECT.Consumer>
                {({ width }) => (
                    <Div
                        className='overlayContainer'
                        background='black'
                        position='absolute'
                        width={width}
                        display='inline-block'
                        aspect-ratio='16/9'
                        top={this.props.preview ? 0 : '50%'}
                        left={this.props.preview ? 0 : '50%'}
                        referrer={this.props.referrer}
                        style={{
                            overflow: 'hidden',
                            transform: !this.props.preview && 'translate(-50%, -50%)',
                        }}>
                        <OverlayContainer
                            scene={BI().getTempScene()}
                            ratio={this.props.ratio}
                            isTemp={true}
                            preview={this.props.preview}
                            isTransition={this.state.isTransition}
                        />
                        <OverlayContainer
                            scene={BI().currentScene()}
                            ratio={this.props.ratio}
                            isTemp={false}
                            preview={this.props.preview}
                            isTransition={this.state.isTransition}
                        />
                    </Div>
                )}
            </CANVAS_RECT.Consumer>
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
        function CurrentScene({ mode, saveScene }) {
            switch (mode) {
                case ItemlistType.SCENES:
                    return <h1>{BI().currentScene().name}</h1>
                case ItemlistType.TRANSITIONS:
                    return <h1>장면 전환</h1>
                case ItemlistType.OVERLAYS:
                    return (
                        <>
                            <input
                                type='text'
                                defaultValue={BI().currentScene().name}
                                onChange={(e) => {
                                    BI().currentScene().name = e.target.value
                                }}
                            />
                            <button onClick={saveScene}>저장</button>
                            <button
                                onClick={() => {
                                    BI().deleteScene(BI().info.scene.indexOf(BI().currentScene()))
                                    saveScene()
                                }}>
                                삭제
                            </button>
                        </>
                    )
                default:
                    throw new Error('Invalid itemlist mode')
            }
        }

        return (
            <Header flex fixsize flex-justify='space-between' flex-align='center' border-bottom='normal' height='64'>
                <Div flex fixsize padding-left='8'>
                    <CurrentScene mode={this.props.mode} saveScene={this.props.saveScene} />
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
