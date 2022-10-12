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

    context.log('JavaScript HTTP trigger function processed a request.')

    const name = (req.query.name || (req.body && req.body.name))
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response."

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    }
}
