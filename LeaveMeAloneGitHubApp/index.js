const crypto = require('crypto')

/** Validates the signature added by GitHub */
const validateGitHubWebHook = (context) => {
    const secret = process.env['GITHUB_WEBHOOK_SECRET']
    if (!secret) {
        throw new Error('Webhook secret not configured')
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

module.exports = async function (context, req) {
    try {
        validateGitHubWebHook(context)
    } catch (e) {
        context.log(e)
        context.res = {
            status: 403,
            body: `Go away, you are not a valid GitHub webhook: ${e}`,
        }
        context.done()
        return
    }

    context.log("Got headers")
    context.log(req.headers)
    context.log("Got body")
    context.log(req.body)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `Received event ${req.headers["x-github-event"]}`
    }
}
