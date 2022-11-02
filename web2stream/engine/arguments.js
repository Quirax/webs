import logger from './logger.js'

var args = process.argv.slice(2)

export default {
    getUrl: () => {
        const url = args[0]
        logger.log('Working on url: ' + url)
        if (url === undefined || url === '') {
            logger.log('Exiting url is not defined in the params')
            process.exit(1)
        }
        return url
    },
    getOutputName: () => {
        const outputName = args[1]
        logger.log('Output Name of: ' + outputName)
        if (outputName == null || outputName === '') {
            logger.log('Exiting, output name is not defined in the params')
            process.exit(1)
        }
        return outputName
    },
    getRtmpUrl: () => {
        const rtmpUrl = args[2]
        logger.log('Rtmp Url: ' + rtmpUrl)
        if (rtmpUrl == null || rtmpUrl === '') {
            return undefined
        }
        return rtmpUrl
    },
}
