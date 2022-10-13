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
