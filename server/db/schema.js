import { Schema } from 'mongoose'

const OverlaySchema = new Schema(
    {
        name: String,
        type: String,
        id: String,
        params: {},
        transform: {
            x: Number,
            y: Number,
            height: Number,
            width: Number,
            rotate: Number,
        },
    },
    { _id: false, id: false, typeKey: '$type' }
)

const SceneSchema = new Schema(
    {
        name: String,
        defaultCategory: Number,
        defaultTitle: String,
        id: String,
        overlay: [OverlaySchema],
    },
    { _id: false, id: false, typeKey: '$type' }
)

const TransitionSchema = new Schema(
    {
        name: String,
        id: String,
        type: String,
        params: {},
    },
    { _id: false, id: false, typeKey: '$type' }
)

export default new Schema(
    {
        uid: String,
        title: String,
        category: Number,
        currentScene: { type: Number, default: 0 },
        currentTransition: { type: Number, default: 0 },
        scene: [SceneSchema],
        transition: [TransitionSchema],
    },
    { toObject: { getters: true } }
)
