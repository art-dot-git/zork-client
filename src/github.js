const GitHubApi = require('github')

/**
 * Get a simple github client
 */
module.exports.getClient = (token) => {
    const github = new GitHubApi({
        version: "3.0.0",
        headers: {
            "user-agent": "zork-git-client"
        }
    })

    github.authenticate({
        type: "oauth",
        token: token
    })
    return github
}