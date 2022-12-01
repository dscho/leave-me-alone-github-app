const crypto = require('crypto')

/** Validates the signature added by GitHub */
module.exports = (context) => {
    const secret = process.env['GITHUB_WEBHOOK_SECRET']
    if (!secret) {
        throw new Error('Webhook secret not configured')
    }
    if (context.req.method !== 'POST') {
        throw new Error(`Unexpected method: ${context.req.method}`)
    }
    if (context.req.headers['content-type'] !== 'application/json') {
        throw new Error(`Unexpected content type: ${context.req.headers['content-type']}`)
    }
    const signature = context.req.headers['x-hub-signature-256']
    if (!signature) {
        throw new Error('Missing X-Hub-Signature')
    }
    const sha256 = signature.match(/^sha256=(.*)/)
    if (!sha256) {
        throw new Error(`Unexpected X-Hub-Signature format: ${signature}`)
    }
    const computed = crypto.createHmac('sha256', secret).update(context.req.rawBody).digest('hex')
    if (sha256[1] !== computed) {
        throw new Error('Incorrect X-Hub-Signature')
    }
}

