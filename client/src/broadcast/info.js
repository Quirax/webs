class BroadcastInfo {
    static instance

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
                        {
                            name: '테스트 텍스트 1',
                            type: 'text',
                            params: {
                                text: 'Lorem Ipsum 로렘 입수움',
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
        if (!BroadcastInfo.instance)
            BroadcastInfo.instance = new BroadcastInfo()
        return BroadcastInfo.instance
    }

    onChange() {
        // Connector.syncBroadcastInfo(this.bi)
        // console.log('onChange', this.info)
    }

    afterChange() {
        // Connector.saveBroadcastInfo(this.bi)
        console.log('afterChange', this.info)
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
