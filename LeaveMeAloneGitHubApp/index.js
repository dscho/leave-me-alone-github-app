const crypto = require('crypto')

/** Validates the signature added by GitHub */
const validateGitHubWebHook = (context) => {
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

/** Sends a JWT-authenticated GitHub API request */
const gitHubApiRequestAsApp = async (context, appId, requestMethod, requestPath, body) => {
    const header = {
        "alg": "RS256",
        "typ": "JWT"
    }

    const now = Math.floor(new Date().getTime() / 1000)

    const payload = {
        // issued at time, 60 seconds in the past to allow for clock drift
        iat: now - 60,
        // JWT expiration time (10 minute maximum)
        exp: now + (10 * 60),
        // GitHub App's identifier
        iss: appId
    }

    const toBase64 = (obj) => Buffer.from(JSON.stringify(obj), "utf-8").toString("base64url")
	const headerAndPayload = `${toBase64(header)}.${toBase64(payload)}`

    const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${process.env['GITHUB_APP_PRIVATE_KEY']}\n-----END RSA PRIVATE KEY-----\n`

    const signer = crypto.createSign("RSA-SHA256")
    signer.update(headerAndPayload)
    const signature = signer.sign({
        key: privateKey
    }, "base64url")

    const token = `${headerAndPayload}.${signature}`

    const httpsRequest = require('./https-request')
    return await httpsRequest(
        context,
        requestMethod,
        requestPath,
        body,
        {
            Authorization: `Bearer ${token}`,
        }
    )
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
        return
    }

    if (req.headers['x-github-event'] === 'installation' && req.body.action === 'created') {
        try {
            const res = await gitHubApiRequestAsApp(context, req.body.installation.app_id, 'DELETE', `/app/installations/${req.body.installation.id}`)
            context.log(`Deleted installation ${req.body.installation.id} on ${req.body.repositories.map(e => e.full_name).join(", ")}`)
            context.log(res)
            context.res = {
                status: 200,
                body: `Deleted installation`,
            }
        } catch (e) {
            context.log(e)
            context.res = {
                status: 500,
                body: `Error:\n${e}`,
            }
        }
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
