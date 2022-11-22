# The _Leave Me Alone_ GitHub App

<p align="center">
<img alt="Leave me alone box" src="leave-me-alone-box.gif" />
</p>
<p align="center">
<i><a href="https://www.youtube.com/watch?v=CTCPFRIUqFo">Leave me alone box</a></i> <small>(<a href="https://www.youtube.com/t/creative_commons">CC BY</a>)</small>
</p>

Inspired by the ["Leave me alone box"](https://en.wikipedia.org/wiki/Useless_machine), the purpose of this GitHub App is to do only one thing: whenever it is installed, it uninstalls itself.

The only practical use of this GitHub App is to demonstrate
- how to implement a GitHub App as a serverless Azure Function,
- how to validate that a request has been sent by GitHub,
- how to use the GitHub App's credentials to call GitHub's REST API in a pure node.js script without needing to install any packages, and
- how to deploy the Azure Function continuously from a GitHub repository.

## Tips & Tricks for developing this GitHub App

### Debug/test-run as much Javascript via the command-line as possible

The easiest, and quickest, way to test most of the Javascript code is to run it on the command-line, via `node`.

To facilitate that, as much functionality is implemented in modules as possible.

### Run the Azure Function locally

It is tempting to try to develop the Azure Function part of this GitHub App directly in the Azure Portal, but it is cumbersome and slow, and also impossibly unwieldy once the Azure Function has been deployed via GitHub (because that disables editing the Javascript code in the Portal).

Instead of pushing the code to Azure all the time, waiting until it is deployed, reading the logs, then editing the code, committing and starting another cycle, it is much, much less painful to develop the Azure Function locally.

To this end, [install the Azure Functions Core Tools (for performance, use Linux)](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash#install-the-azure-functions-core-tools), e.g. via WSL.

Then, configure [the `GITHUB_*` variables](#some-environment-variables) locally, via [a `local.settings.json` file](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local#local-settings-file). The contents would look like this:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "<storage-key>",
    "GITHUB_APP_CLIENT_ID": "<client-id>",
    "GITHUB_APP_CLIENT_SECRET": "<client-secret>",
    "GITHUB_APP_PRIVATE_KEY": "<private-key>",
    "GITHUB_WEBHOOK_SECRET": "<webhook-secret>"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

Finally, [run the Function locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Cnode%2Cportal%2Cbash#start) by calling `func start` on the command-line.

## How this GitHub App was set up

This process looks a bit complex, but the main reason for that is that three things have to be set up essentially simultaneously: an Azure Function, a GitHub repository and a GitHub App.

### The Azure Function

First of all, a new [Azure Function](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Web%2Fsites/kind/functionapp) was created. A Linux one was preferred, for cost and performance reasons. Deployment with GitHub was _not_ yet configured.

#### Getting the "publish profile"

After the deployment succeeded, in the "Overview" tab, there is a "Get publish profile" link on the right panel at the center top. Clicking it will automatically download a `.json` file whose contents will be needed later.

#### Some environment variables

A few environment variables will have to be configured for use with the Azure Function. This can be done on the "Configuration" tab, which is in the "Settings" group.

Concretely, the environment variables `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_CLIENT_ID` and `GITHUB_APP_ID` need to be set. For the first, a generated random string was used. The private key, client secret and ID of the GitHub App are not known at this time, though, therefore they will have to be set in the Azure Function Configuration later.

### The repository

On https://github.com/, the `+` link on the top was pressed, and an empty, private repository was registered. Nothing was pushed to it yet.

After that, the contents of the publish profile that [was downloaded earlier](#getting-the-publish-profile) was registered as Actions secret, under the name `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`.

This repository was initialized locally only after that, actually, by starting to write this `README.md` and then developing this working toy GitHub App, and the `origin` remote was set to the newly registered repository on GitHub.

As a last step, the repository was pushed, triggering the deployment to the Azure Function.

### The GitHub App

Finally, [a new GitHub App was registered](https://github.com/settings/apps/new).

The repository URL on GitHub was used as homepage URL.

As Webhook URL, the URL of the Azure Function was used, which can be copied in the "Functions" tab of the Azure Function. It looks similar to this: https://my-github-app.azurewebsites.net/api/MyGitHubApp

The value stored in the Azure Function as `GITHUB_WEBHOOK_SECRET` was used as Webhook secret.

No repository permissions were selected.

The GitHub App was then restricted to be used "Only on this account", and once everything worked, it was made public (in the "Advanced" tab of the App's settings).

Even at this stage, a private key could not be generated yet, therefore the App had to be registered without it.

After the successful creation, the private key was generated (almost all the way to the bottom, in the section "Private key", there was a button labeled "Generate a private key") and then the middle part (i.e. the lines without the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` boilerplate), _without newlines_, was stored as `GITHUB_APP_PRIVATE_KEY` in the Azure Function Configuration (something like `cat ~/Downloads/my-github-app.pem | sed -e 1d -e \$d | tr -d '\n'` prints the desired value).

Likewise, there was now a button labeled "Generate a new client secret" in the "Client secrets" section, and it was used to generate that secret. Subsequently, this secret was stored in the Azure Function Configuration as `GITHUB_APP_CLIENT_SECRET`.

At long last, the "App ID" and the "Client ID" which are reported at the top of the GitHub App page (and which is apparently not _really_ considered to be secret) were stored in the Azure Function Configuration as `GITHUB_APP_ID` and `GITHUB_APP_CLIENT_ID`, respectively.
