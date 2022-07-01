import { OverlayParam, OverlayType } from './overlay'

class BroadcastInfo {
    static instance

    constructor() {
        this.container = <></>
        this.list = <></>

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
                        {
                            name: '테스트 도형 1',
                            type: OverlayType.SHAPE,
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
                                shape_type: OverlayParam.shape_type.TRIANGLE,
                                triangle_position: 45,
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
    }

    static getInstance() {
        if (!BroadcastInfo.instance) BroadcastInfo.instance = new BroadcastInfo()
        return BroadcastInfo.instance
    }

    onChange(update = true) {
        // Connector.syncBroadcastInfo(this.bi)
        console.log('onChange', this.info, update ? 'update' : 'no')
        update && this.container.forceUpdate()
        this.list.forceUpdate()
    }

    afterChange() {
        // Connector.saveBroadcastInfo(this.bi)
        console.log('afterChange', this.info)
        this.container.forceUpdate()
        this.list.forceUpdate()
    }

    currentScene() {
        return this.info.scene[this.info.currentScene]
    }

    assignContainer(container) {
        this.container = container
        console.log(this.container)
    }

    assignList(list) {
        this.list = list
        console.log(this.list)
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
