import winston from 'winston'

const logger = winston.createLogger({
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'combined.log' })],
})

export default {
    log: function (message) {
        logger.log({
            level: 'info',
            message: '[Bullman] ' + message,
        })
    },
}
