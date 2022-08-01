import Itemlist from './itemlist'
import { OverlayParam, OverlayType } from './overlay'

let updateContainer = () => {}
let updateList = () => {}

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
                    name: '저챗',
                    defaultCategory: 'Just Chatting',
                    overlay: [
                        // TODO: overlay sample
                        {
                            name: '샘플 웹캠 오버레이',
                            type: OverlayType.WEBCAM,
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
                                src_type: OverlayParam.src_type.URL,
                                src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            },
                            transform: {
                                x: 0,
                                y: 0,
                                height: 100,
                                width: 300,
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

        this.onChange = (update = true) => {
            console.log('onChange', this.info, update ? 'update' : 'no')
            console.log(updateList, updateContainer)
            updateList()
            update && updateContainer()
        }

        this.afterChange = () => {
            console.log('afterChange', this.info)
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

    selectScene(idx) {
        this.info.currentScene = idx
    }

    currentTransition() {
        return this.info.transition[this.info.currentTransition]
    }

    selectTransition(idx) {
        this.info.currentTransition = idx
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
