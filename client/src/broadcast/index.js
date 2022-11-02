import React from 'react'
import { Header, Main, Div, Footer, Article, CommonProps } from '../components'
import './index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faMicrophoneSlash, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import Connector from '../connector'
import OverlayContainer from './overlay'
import Itemlist, { ItemlistType } from './itemlist'
import BI, { assignTitle, assignContainer, assignStatus } from './info'
import Twitch from '../twitch'
import Autosuggest from 'react-autosuggest'

export const CANVAS_RECT = React.createContext({ width: 1920, height: 1080 })

export default class Broadcast extends React.Component {
    constructor() {
        super()

        this.state = {
            canvasRect: { height: 1080, width: 1920 },
            isBroadcasting: false,
            isMic: false,
            mode: '',
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

        this.toggleBroadcast = async () => {
            let connector = Connector.getInstance()
            connector.connect()

            if (this.state.isBroadcasting) connector.stop()
            else await connector.start()

            this.setState({
                isBroadcasting: !this.state.isBroadcasting,
            })
            BI().afterChange()
        }
        this.toggleBroadcast = this.toggleBroadcast.bind(this)

        this.toggleMic = async () => {
            let connector = Connector.getInstance()
            connector.connect()

            if (this.state.isMic) {
                connector.detachMic()
                this.setState({
                    isMic: false,
                })
            } else
                await connector.attachMicStream((stream) => {
                    this.setState({
                        isMic: true,
                    })
                })
        }
        this.toggleMic = this.toggleMic.bind(this)

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

        this.onClickTitle = () => {
            if (this.state.mode === '') this.changeMode(ItemlistType.SCENES)
            else this.changeMode('')
            setTimeout(this.getRects, 100)
        }
        this.onClickTitle = this.onClickTitle.bind(this)
    }

    async componentDidMount() {
        let connector = Connector.getInstance()
        Connector.setIsPreview(this.props.preview)

        if (!this.props.preview) {
            let twitch = Twitch.getInstance()
            await twitch.connect()
            connector.connect(twitch.user.id)
            console.log(connector, twitch, BI())
        } else {
            const query = new URLSearchParams(window.location.search)
            if (query.get('id')) connector.connect(query.get('id'))
        }
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
                    <Microphoner />
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
                    toggleMic={this.toggleMic}
                    isMic={this.state.isMic}
                    mode={this.state.mode}
                    onClickTitle={this.onClickTitle}
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
                            <Description mode={this.state.mode} />
                            <Status />
                        </Footer>
                    </Main>
                </Div>
            </CommonProps>
        )
    }
}

class Microphoner extends React.Component {
    state = {}

    constructor() {
        super()

        this.AudioRef = React.createRef()
    }

    async componentDidMount() {
        const connector = Connector.getInstance()

        await connector.attachMicStream((stream) => {
            this.AudioRef.current && (this.AudioRef.current.srcObject = stream)
        })
    }

    render() {
        return <audio alt='mic' ref={this.AudioRef} autoPlay muted={false} />
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
        function CurrentScene({ mode, saveScene, onClickTitle }) {
            switch (mode) {
                case ItemlistType.TRANSITIONS:
                    return <h1 onClick={onClickTitle}>장면 전환</h1>
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
                    return <h1 onClick={onClickTitle}>{BI().currentScene().name}</h1>
            }
        }

        return (
            <Header flex fixsize flex-justify='space-between' flex-align='center' border-bottom='normal' height='64'>
                <Div flex fixsize padding-left='8'>
                    <CurrentScene
                        mode={this.props.mode}
                        saveScene={this.props.saveScene}
                        onClickTitle={this.props.onClickTitle}
                    />
                </Div>
                <Div fixsize padding-right='8'>
                    <button onClick={this.props.toggleMic}>
                        <FontAwesomeIcon icon={this.props.isMic ? faMicrophone : faMicrophoneSlash} />
                    </button>
                    <button onClick={this.props.toggleBroadcast}>
                        {this.props.isBroadcasting ? '방송 종료' : '방송 시작'}
                    </button>
                </Div>
            </Header>
        )
    }
}

class Description extends React.Component {
    state = {
        category: '',
        suggestions: [],
        title: '',
    }

    constructor() {
        super()

        const onChangeCategory = (e, { newValue }) => {
            this.setState({
                category: newValue,
            })
        }

        let changingTitle = false

        const onBlurTitle = () => {
            console.log('onBlurTitle')
            const twitch = Twitch.getInstance()
            twitch.setDescription({
                category_id: BI().info.category,
                title: BI().info.title || '',
            })
            changingTitle = false
        }

        const onChangeTitle = (e) => {
            if (this.props.mode === ItemlistType.OVERLAYS) {
                BI().currentScene().defaultTitle = e.target.value || ''
            } else {
                BI().info.title = e.target.value || ''

                if (!changingTitle) {
                    setTimeout(() => {
                        if (changingTitle) onBlurTitle()
                    }, 5000)
                    changingTitle = true
                }
            }

            this.setState({
                title: e.target.value || '',
            })
            BI().afterChange()
        }

        const onFetchReq = async ({ value }) => {
            let twitch = Twitch.getInstance()
            this.setState({
                suggestions: (await twitch.searchCategories(value)) || [],
            })
        }

        const onClearReq = () => {
            this.setState({
                suggestions: [],
            })
        }

        const getSuggestion = (suggestion) => suggestion.name

        const renderSuggestion = (suggestion, { isHighlighted }) => (
            <div
                style={{
                    backgroundColor: isHighlighted ? 'blue' : null,
                    color: isHighlighted ? 'white' : null,
                    lineHeight: 1.2,
                    padding: '8px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    borderTop: suggestion.id === this.state.suggestions[0].id ? null : '1px solid black',
                }}>
                <img
                    src={suggestion.box_art_url}
                    alt={suggestion.name}
                    style={{
                        height: '48px',
                        padding: '4px',
                        border: '1px solid black',
                        marginRight: '8px',
                        verticalAlign: 'middle',
                    }}
                />
                {suggestion.name}
            </div>
        )

        const onSelected = async (e, { suggestion }) => {
            if (this.props.mode === ItemlistType.OVERLAYS) {
                BI().currentScene().defaultCategory = suggestion.id
            } else {
                BI().info.category = suggestion.id

                const twitch = Twitch.getInstance()
                await twitch.setDescription({
                    category_id: suggestion.id,
                    title: BI().info.title,
                })
            }
            BI().afterChange()
        }

        this.render = () => {
            return (
                <Div flex flex-direction='column' flex-justify='center' padding-left='8'>
                    <input
                        type='text'
                        placeholder='방송제목'
                        value={this.state.title || ''}
                        onChange={onChangeTitle}
                        onBlur={onBlurTitle}
                    />
                    <Autosuggest
                        suggestions={this.state.suggestions}
                        onSuggestionsFetchRequested={onFetchReq}
                        onSuggestionsClearRequested={onClearReq}
                        getSuggestionValue={getSuggestion}
                        renderSuggestion={renderSuggestion}
                        onSuggestionSelected={onSelected}
                        highlightFirstSuggestion={true}
                        inputProps={{
                            placeholder: '카테고리',
                            value: this.state.category,
                            onChange: onChangeCategory,
                        }}
                        theme={{
                            suggestionsContainerOpen: {
                                position: 'fixed',
                                bottom: `${8 + 16 * 1.2 + 2 + 2}px`,
                                border: '1px solid black',
                                backgroundColor: 'white',
                                maxHeight: '300px',
                                width: '250px',
                                overflowY: 'scroll',
                            },
                        }}
                    />
                </Div>
            )
        }

        assignStatus(() => {
            BI().info.category = BI().currentScene().defaultCategory
            BI().info.title = BI().currentScene().defaultTitle

            const desc = {
                category_id: BI().info.category,
                title: BI().info.title,
            }

            const conn = Connector.getInstance()
            conn.setDescription(desc)
            ;(async () => {
                const twitch = Twitch.getInstance()
                this.setState({
                    category: (await twitch.getCategoryWithID(desc.category_id)).name || '',
                    title: desc.title,
                })
                await twitch.setDescription(desc)
            })()
        })

        let mode = null

        this.componentDidUpdate = async () => {
            if (mode !== this.props.mode) {
                const twitch = Twitch.getInstance()
                let category_id =
                    this.props.mode === ItemlistType.OVERLAYS
                        ? BI().currentScene()?.defaultCategory
                        : BI().info?.category
                let category = ''
                if (category_id) category = (await twitch.getCategoryWithID(category_id)).name || ''
                this.setState({
                    category: category,
                    title:
                        (this.props.mode === ItemlistType.OVERLAYS
                            ? BI().currentScene()?.defaultTitle
                            : BI().info?.title) || '',
                })
                mode = this.props.mode
            }
        }
    }
}

class Status extends React.Component {
    state = {
        viewerCount: 0,
        timeStarted: undefined,
        timeElapsed: 0,
    }

    constructor() {
        super()

        let refresher = undefined
        let timer = undefined

        this.componentDidMount = () => {
            refresher = setInterval(async () => {
                const twitch = Twitch.getInstance()
                const data = await twitch.getStatus()

                if (data) {
                    this.setState({
                        viewerCount: data.viewer_count,
                        timeStarted: new Date(data.started_at),
                    })

                    if (!timer) {
                        timer = setInterval(() => {
                            this.setState({
                                timeElapsed: new Date() - new Date(this.state.timeStarted),
                            })
                        }, 1000)
                    }
                } else {
                    this.setState({
                        viewerCount: 0,
                        timeStarted: undefined,
                        timeElapsed: 0,
                    })

                    if (timer) {
                        clearInterval(timer)
                        timer = undefined
                    }
                }
            }, 5000)
        }

        this.componentWillUnmount = () => {
            clearInterval(refresher)
        }
    }

    render() {
        let { timeElapsed, viewerCount } = this.state
        timeElapsed /= 1000
        let hours = Math.floor(timeElapsed / 3600),
            minutes = Math.floor((timeElapsed % 3600) / 60),
            seconds = Math.floor((timeElapsed % 3600) % 60)

        return (
            <Div flex flex-direction='column' flex-justify='center' padding-right='8' align='right'>
                {/* FIXME: 방송 시 방송 통계와 동기화 */}
                <div
                    style={{
                        color: this.state.timeStarted && 'red',
                    }}>
                    <FontAwesomeIcon icon={faUserAlt} /> {viewerCount}
                </div>
                <div>
                    {[
                        String(hours).padStart(2, '0'),
                        String(minutes).padStart(2, '0'),
                        String(seconds).padStart(2, '0'),
                    ].join(':')}
                </div>
            </Div>
        )
    }
}
