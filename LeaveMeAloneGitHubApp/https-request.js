module.exports = async (context, requestMethod, requestPath, body, headers) => {
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
        hostname: 'api.github.com',
        port: 443,
        path: requestPath,
        method: requestMethod || 'GET',
        headers
    }
    return new Promise((resolve, reject) => {
        const https = require('https')
        const request = https.request(options, (res, e) => {
            if (e) {
                reject(e)
                return
            }
            context.log(`${requestPath} returned ${res.statusCode}`)
            context.log(res.headers)
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
            res.on('error', (e) => {
                reject(e)
            })
        })
        if (body) request.write(body)
        request.end()
    })
}
