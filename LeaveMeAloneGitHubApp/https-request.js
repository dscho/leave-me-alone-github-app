module.exports = async (context, hostname, method, requestPath, body, headers) => {
    headers = {
        'User-Agent': 'curl/7.68.0',
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

                res.setEncoding('utf8')
                var response = ''
                res.on('data', (chunk) => {
                    response += chunk
                })
                res.on('end', () => {
                    if (!response) {
                        resolve(response)
                        return
                    }
                    try {
                        resolve(JSON.parse(response))
                    } catch (e) {
                        reject(e)
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
