const service = require('../services/job')
const logger = require('../logger')

exports.list = function (req, res) {
    const response = service.list()
    res.json(response)
}

exports.create = async function (req, res) {
    logger.log('jobService::create()')
    const job = req.body
    const response = await service.create(job)
    logger.log('This is the response: ' + JSON.stringify(response))
    res.json(response)
}

exports.stop = function (req, res) {
    const jobId = req.params.id
    const response = service.stop(jobId)
    logger.log('This is the response: ' + response)
    res.json(response)
}

function doNotFound(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('404 Not Found')
}

exports.playlist = (req, res) => {
    const jobId = req.params.id
    try {
        const stream = service.playlist(jobId)
        if (stream) {
            stream.on('error', () => {
                stream.unpipe(res)
                doNotFound(res)
            })
            stream.pipe(res)
        } else {
            doNotFound(res)
        }
    } catch (err) {
        doNotFound(res)
    }
}

exports.ts = (req, res) => {
    const jobId = req.params.id
    const ts = req.params.ts
    try {
        const stream = service.ts(jobId, ts)
        if (stream) {
            stream.on('error', () => {
                stream.unpipe(res)
                doNotFound(res)
            })
            stream.pipe(res)
        } else {
            doNotFound(res)
        }
    } catch (err) {
        doNotFound(res)
    }
}

exports.message = (req, res) => {
    const jobId = req.params.id
    const message = req.body

    if (!service.message(jobId, message)) {
        doNotFound(res)
    } else {
        res.json('"ok"')
    }
}
