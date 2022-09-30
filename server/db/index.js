import mongoose from 'mongoose'
import schema from './schema.js'

mongoose.connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    { useNewUrlParser: true }
)

const db = mongoose.connection
db.on('error', (e) => console.warn('Error occurred while connecting to database: ' + e))
db.once('open', () => console.info('Server is connected to database'))

const BI = mongoose.model('BI', schema)

const GenerateID = () => Math.random().toString(36).substring(2, 11)

export default {
    BI,
    newUser: (uid) =>
        new BI({
            uid: uid,
            title: '',
            category: 509658,
            currentScene: 0,
            currentTransition: 0,
            scene: [
                {
                    name: '기본',
                    defaultCategory: 509658,
                    id: GenerateID(),
                    overlay: [],
                },
            ],
            transition: [
                {
                    name: '기본',
                    id: GenerateID(),
                    type: 'plain',
                    params: {},
                },
            ],
        }),
    save: (item) =>
        new Promise((resolve, reject) => {
            item.save((err, data) => {
                if (err) {
                    console.warn('Error occurred while saving: ' + err)
                    return reject(err)
                } else {
                    console.info('Data saved successfully!')
                    return resolve(data)
                }
            })
        }),
    get: (uid) =>
        new Promise((resolve, reject) => {
            BI.findOne({ uid: uid }, (err, item) => {
                if (err) {
                    console.warn(`Error occurred while getting item with uid=${uid}: ${err}`)
                    return reject(err)
                } else return resolve(item)
            })
        }),
}
