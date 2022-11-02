const spawn = require('child_process').spawn
const terminate = require('terminate')
const logger = require('../logger')
const db = {}
const fs = require('fs')

exports.list = function () {
    return 'This is the response from this method Job::List()'
}

exports.create = async function (job) {
    logger.log('Starting a screencaster job')
    if (job.rtmpUrl === '' && Object.values(db).includes(job.outputName)) {
        logger.log('There is already HLS process for output name: ' + job.outputName)

        let pid = Object.keys(db).find((key) => db[key].name === job.outputName)
        logger.log('Process Pid: ' + pid)
        job.jobId = pid
        return job
    }
    try {
        const ops = getScreencasterOpts(job)
        screencaster = spawn('node', ops, { stdio: ['pipe', 'pipe', 2, 'ipc'], cwd: '../engine' })
        screencaster.on('message', (msg) => console.log(msg))
        logger.log('Process Pid: ' + screencaster.pid)
        // db[screencaster.pid] = terminateJob(screencaster.pid); // kill process in 1 hour if it is not stopped earlier
    } catch (err) {
        logger.log('Failed badly to start the process ' + err)
        return err
    }
    if (job.rtmpUrl === '')
        db[screencaster.pid] = {
            name: job.outputName,
            ipc: screencaster,
        }

    job.jobId = screencaster.pid
    // screencaster.send({ cmd: 'viewport', height: 640, width: 480 })
    // job.hostUrl = await http.getInstanceIp()
    return job
}

function getScreencasterOpts(job) {
    const options = [
        '../engine/index.js',
        job.url, // url to screencast
        job.outputName, // output name
        job.rtmpUrl, //rtmp url
    ]
    return options
}

function terminateJob(pid) {
    return setTimeout(function () {
        terminate(pid, function (err) {
            if (err) {
                // you will get an error if you did not supply a valid process.pid
                logger.log('Oopsy, the pid was not found:' + err) // handle errors in your preferred way.
            } else {
                logger.log('Closing job by timeout') // terminating the Processes succeeded.
            }
        })
    }, 3600000)
}

exports.stop = function (jobId) {
    terminate(jobId, function (err) {
        if (err) {
            // you will get an error if you did not supply a valid process.pid
            logger.log('Oopsy: ' + err) // handle errors in your preferred way.
        } else {
            logger.log('Closing job by invoking the stop endpoint') // terminating the Processes succeeded.
        }
    })
    if (db[jobId]) {
        dir = db[jobId].name
        delete db[jobId]
        fs.readdirSync(`/var/hls/${dir}`).map((file) => fs.unlinkSync(`/var/hls/${dir}/${file}`))
    }
    //make sure we cancel the timeout
    return 'ok'
}

exports.playlist = (jobId) => {
    if (!db[jobId]) {
        logger.log('There is no stream for job id = ' + jobId)
        return undefined
    }
    return fs.createReadStream(`/var/hls/${db[jobId].name}/playlist.m3u8`)
}

exports.ts = (jobId, ts) => {
    if (!db[jobId]) {
        logger.log('There is no stream for job id = ' + jobId)
        return undefined
    }
    return fs.createReadStream(`/var/hls/${db[jobId].name}/${ts}`)
}

exports.message = (jobId, message) => {
    if (!db[jobId]) {
        logger.log('There is no stream for job id = ' + jobId)
        return undefined
    }
    db[jobId].ipc.send(message)
}
