const GitHubApi = require('github')
const config = require('../config')

/**
 * Get a simple github client
 */
module.exports.getClient = (token) => {
    const github = new GitHubApi({
        version: "3.0.0",
        headers: {
            'user-agent': "zork-git-client"
        }
    })

    github.authenticate({
        type: "oauth",
        token: token
    })
    return github
}

/**
 * Post a comment on a pr to the game repo.
 */
module.exports.postComment = (github, prNumber, message) => {
    if (!config.post_comments)
        return Promise.resolve(message)

    return new Promise(resolve =>
        github.issues.createComment({
            owner: config.repo_organization,
            repo: config.repo_name,
            number: prNumber,
            body: message
        }, err => {
            if (err)
                console.log(`Error posting comment: ${err}`)
            resolve(message)
        }))
}

/**
 * Close a pr on the game repo.
 */
module.exports.closePr = (github, prNumber, base) => {
    if (!config.post_comments)
        return Promise.resolve(prNumber)

    return new Promise((resolve, reject) =>
        github.pullRequests.update({
            owner: config.repo_organization,
            repo: config.repo_name,
            number: prNumber,
            base: base,
            state: 'closed'
        }, err => {
            if (err)
                console.log(`Error closing pr ${prNumber}: ${err}`)
            resolve(prNumber)
    }))
}

/**
 * Get a pull request pull from the game repo
 */
const getPullRequest = module.exports.getPullRequest = (github, number, noRetry) =>
    new Promise((resolve, reject) => {
        github.pullRequests.get({
            owner: config.repo_organization,
            repo: config.repo_name,
            number: number
        }, (err, pullRequest) => {
            if (err) {
                if (noRetry)
                    return reject("Error getting pull request" + err)
                return getPullRequest(github, number, true)
            }
            return resolve(pullRequest)
        })
    })