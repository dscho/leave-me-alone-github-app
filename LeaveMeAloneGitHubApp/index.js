const validateGitHubWebHook = require('./validate-github-webhook')

/** Sends a JWT-authenticated GitHub API request */
const gitHubApiRequestAsApp = require('./github-api-request-as-app')

module.exports = async function (context, req) {
    const withStatus = (status, headers, body) => {
        context.res = {
            status,
            headers,
            body
        }
    }

    const ok = (body) => {
        withStatus(undefined, undefined, body)
    }

    try {
        validateGitHubWebHook(context)
    } catch (e) {
        context.log(e)
        return withStatus(403, undefined, `Go away, you are not a valid GitHub webhook: ${e}`)
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
            return withStatus(500, undefined, `Error:\n${e}`)
        }
        return
    }

    context.log("Got headers")
    context.log(req.headers)
    context.log("Got body")
    context.log(req.body)

    ok(`Received event ${req.headers["x-github-event"]}`)
}
