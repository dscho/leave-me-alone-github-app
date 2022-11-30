module.exports = async (context, appId, requestMethod, requestPath, body) => {
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

    const crypto = require('crypto')
    const signer = crypto.createSign("RSA-SHA256")
    signer.update(headerAndPayload)
    const signature = signer.sign({
        key: privateKey
    }, "base64url")

    const token = `${headerAndPayload}.${signature}`

    const httpsRequest = require('./https-request')
    return await httpsRequest(
        context,
        null,
        requestMethod,
        requestPath,
        body,
        {
            Authorization: `Bearer ${token}`,
        }
    )
}
