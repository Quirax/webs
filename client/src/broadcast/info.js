import { OverlayParam, OverlayType } from './overlay'

let updateContainer = () => {}
let updateList = () => {}
let updateTitle = () => {}

class BroadcastInfo {
    constructor() {
        // this.info = Connector.getBroadcastInfo()
        this.info = {
            uid: 0,
            title: '방송시험중',
            category: 'Just Chatting',
            currentScene: 0,
            currentTransition: 0,
            scene: [
                {
                    name: '빨강',
                    defaultCategory: 'Just Chatting',
                    id: 'red',
                    overlay: [
                        // HACK: overlay sample
                        {
                            name: '사각형',
                            type: OverlayType.SHAPE,
                            id: 'redshape',
                            params: {
                                background_color: '#ff0000',
                                background_opacity: 1,
                                opacity: 1,
                                aspect_ratio: false,
                                radius: 0,
                                border_color: '#000000',
                                border_opacity: 1,
                                border_width: 0,
                                border_style: OverlayParam.border_style.SOLID,
                                margin: 0,
                                padding: 0,

                                // Specific params
                                shape_type: OverlayParam.shape_type.RECTANGLE,
                            },
                            transform: {
                                x: 0,
                                y: 0,
                                height: 1080,
                                width: 1920,
                                rotate: 0,
                            },
                        },
                    ],
                },
                {
                    name: '초록',
                    defaultCategory: 'Just Chatting',
                    id: 'green',
                    overlay: [
                        // HACK: overlay sample
                        {
                            name: '사각형',
                            type: OverlayType.SHAPE,
                            id: 'greenshape',
                            params: {
                                background_color: '#00ff00',
                                background_opacity: 1,
                                opacity: 1,
                                aspect_ratio: false,
                                radius: 1,
                                border_color: '#000000',
                                border_opacity: 1,
                                border_width: 0,
                                border_style: OverlayParam.border_style.SOLID,
                                margin: 0,
                                padding: 0,

                                // Specific params
                                shape_type: OverlayParam.shape_type.RECTANGLE,
                            },
                            transform: {
                                x: 0,
                                y: 0,
                                height: 1080,
                                width: 1920,
                                rotate: 0,
                            },
                        },
                    ],
                },
                {
                    name: '파랑',
                    defaultCategory: 'Just Chatting',
                    id: 'blue',
                    overlay: [
                        // HACK: overlay sample
                        {
                            name: '사각형',
                            type: OverlayType.SHAPE,
                            id: 'blueshape',
                            params: {
                                background_color: '#0000ff',
                                background_opacity: 1,
                                opacity: 1,
                                aspect_ratio: false,
                                radius: 1,
                                border_color: '#000000',
                                border_opacity: 1,
                                border_width: 0,
                                border_style: OverlayParam.border_style.SOLID,
                                margin: 0,
                                padding: 0,

                                // Specific params
                                shape_type: OverlayParam.shape_type.RECTANGLE,
                            },
                            transform: {
                                x: 0,
                                y: 0,
                                height: 1080,
                                width: 1920,
                                rotate: 0,
                            },
                        },
                    ],
                },
            ],
            transition: [
                {
                    name: '기본',
                    type: 0,
                    params: {},
                },
            ],
        }

        this.tempScene = 0

        this.onChange = (update = true) => {
            updateList()
            update && updateContainer()
        }

        this.afterChange = () => {
            updateContainer()
            updateList()
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new BroadcastInfo()
        }
        return this.instance
    }

    currentScene() {
        return this.info.scene[this.info.currentScene]
    }

    getTempScene() {
        return this.info.scene[this.tempScene]
    }

    selectScene(idx) {
        if (this.info.currentScene === idx) return

        this.tempScene = this.info.currentScene
        this.info.currentScene = idx
        console.log(this.tempScene, this.info.currentScene, updateContainer)
        updateContainer()
        updateList()
        updateTitle()
    }

    isCurrentScene(idx) {
        return this.info.currentScene === idx
    }

    currentTransition() {
        return this.info.transition[this.info.currentTransition]
    }

    selectTransition(idx) {
        this.info.currentTransition = idx
        updateContainer()
        updateList()
        updateTitle()
    }

    isCurrentTransition(idx) {
        return this.info.currentTransition === idx
    }
}

export default function BI() {
    let bi = BroadcastInfo.getInstance()
    return bi
}

export function assignContainer(c) {
    updateContainer = c
}

export function assignList(l) {
    updateList = l
}

export function assignTitle(t) {
    updateTitle = t
}
