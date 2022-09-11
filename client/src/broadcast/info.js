import { OverlayParam, OverlayType } from './overlay'
import { TransitionType, TransitionParam } from './transition'

let updateContainer = () => {}
let updateList = () => {}
let updateTitle = () => {}

class BroadcastInfo {
    constructor() {
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

    setInfo(info) {
        this.info = info
        updateContainer()
        updateList()
        updateTitle()
    }

    currentScene() {
        if (!this.info) return {}
        return this.info.scene[this.info.currentScene]
    }

    getTempScene() {
        if (!this.info) return {}
        return this.info.scene[this.tempScene]
    }

    selectScene(idx) {
        if (this.info.currentScene === idx) return

        this.tempScene = this.info.currentScene
        this.info.currentScene = idx

        updateContainer(true)
        updateList()
        updateTitle()
    }

    // FIXME : add deleteScene(idx)

    isCurrentScene(idx) {
        if (!this.info) return true
        return this.info.currentScene === idx
    }

    currentTransition() {
        if (!this.info) return {}
        return this.info.transition[this.info.currentTransition]
    }

    selectTransition(idx) {
        if (!this.info) return
        this.info.currentTransition = idx
        updateContainer()
        updateList()
        updateTitle()
    }

    isCurrentTransition(idx) {
        if (!this.info) return true
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
