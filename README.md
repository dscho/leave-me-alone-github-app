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

## How this GitHub App was set up

This process looks a bit complex, but the main reason for that is that three things have to be set up essentially simultaneously: an Azure Function, a GitHub repository and a GitHub App.

### The Azure Function

First of all, a new [Azure Function](https://portal.azure.com/#blade/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.Web%2Fsites/kind/functionapp) was created. A Linux one was preferred, for cost and performance reasons. Deployment with GitHub was _not_ yet configured.

#### Getting the "publish profile"

After the deployment succeeded, in the "Overview" tab, there is a "Get publish profile" link on the right panel at the center top. Clicking it will automatically download a `.json` file whose contents will be needed later.

#### Some environment variables

A few environment variables will have to be configured for use with the Azure Function. This can be done on the "Configuration" tab, which is in the "Settings" group.

Concretely, the environment variables `GITHUB_WEBHOOK_SECRET` and `GITHUB_APP_PRIVATE_KEY` need to be set. For the first, a generated random string was used. The private key of the GitHub App is not known at this time, though, therefore it will have to be set in the Azure Function Configuration later.

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

After the successful creation, the private key was generated and then the middle part (i.e. the lines without the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` boilerplate), _without newlines_, was stored as `GITHUB_APP_PRIVATE_KEY` in the Azure Function Configuration.
