const gently = require('./gently')

module.exports = async (context, hostname, method, requestPath, body, headers) => {
    headers = {
        'User-Agent': 'LeaveMeAloneGitHubApp/0.0',
        Accept: 'application/json',
        ...headers || {}
    }
    if (body) {
        if (typeof body === 'object') body = JSON.stringify(body)
        headers['Content-Type'] = 'application/json'
        headers['Content-Length'] = body.length
    }
    const options = {
        port: 443,
        hostname: hostname || 'api.github.com',
        method: method || 'GET',
        path: requestPath,
        headers
    }
    return new Promise((resolve, reject) => {
        try {
            const https = require('https')
            const req = https.request(options, res => {
                res.on('error', e => reject(e))

                if (res.statusCode === 204) resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers
                 })

                const chunks = []
                res.on('data', data => chunks.push(data))
                res.on('end', () => {
                    const json = Buffer.concat(chunks).toString('utf-8')
                    if (res.statusCode > 299) {
                        context.log('FAILED HTTPS request!')
                        context.log(options)
                        reject({
                            statusCode: res.statusCode,
                            statusMessage: res.statusMessage,
                            body: json,
                            json: gently(() => JSON.parse(json))
                        })
                        return
                    }
                    try {
                        resolve(JSON.parse(json))
                    } catch (e) {
                        reject(`Invalid JSON: ${json}`)
                    }
                })
            })
            req.on('error', err => reject(err))
            if (body) req.write(body)
            req.end()
        } catch (e) {
            reject(e)
        }
    })
}
