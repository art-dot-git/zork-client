"use strict"
const gitPromise = require("git-promise")
const parseDiff = require('diffparser')

const command = require('./command')
const game = require('./game_runner')
const config = require('../config')
const ChangeError = require('./change_error')


const BRANCH_REGEXP = /^[a-z0-9\-_]{3,200}$/i

/// Should error attempt to post error comments back to github.
const POST_COMMENTS = true
const PUSH = false


/**
 * Execute a git command on the game repo.
 */
const git = (command) =>
    gitPromise(command, { cwd: config.game_root });

/**
 * 
 */
const getPrBranchName = number =>
    `pr-${number}`

/**
    Handle pull request merge error.
*/
const postComment = (github, pullRequest, message) => {
    if (POST_COMMENTS) {
        return new Promise(resolve =>
            github.issues.createComment({
                owner: config.repo_organization,
                repo: config.repo_name,
                number: pullRequest.number,
                body: message
        }, err => {
            if (err)
                console.log('Error posting comment: ' + err)
            resolve(message);
        }))
    }
    return Promise.resolve(message)
}

/**
 * Handle an error with a pr
 */
const onPrError = (github, pullRequest, error) =>
    postComment(github, pullRequest,
`**ERROR PROCESSING PULL REQUEST**\n

${error}

---

Please correct the above error and update the pull request

* [More info](${config.about_url})
* [Report a system issue](${config.issue_tracker_url})
`)

/**
*/
const deleteBranch = name =>
    git(`branch -D ${name}`)

/**
    Force switch to the master branch.
*/
const forceCheckout = (branch) =>
    git(`checkout -f ${branch}`)

/**
 * Attempt to clean up a bad branch.
 */
const cleanUpBranch = (branchName) =>
    forceCheckout('master').then(_ => {
        return deleteBranch(branchName)
    })

/**
*/
const tryMergeBranch = (branchName) =>
    verifyBranchMerge(branchName).then(data => {
        return git(`merge -m "Automerge: ' + branchName + '" ${branchName}`)
    })

/**
 * Checkout a pull request into its own branch
 */
const checkoutPr = number => {
    const name = getPrBranchName(number)
    return git(`fetch --update-head-ok origin pull/${number}/head:${name}`)
        .then(_ => git(`checkout -f ${name}`))
        .then(_ => git(`pull origin HEAD`))
        .then(_ => name)
        .catch(err => {
            throw `Error checking out PR #${number}: ${err}`
        })
}

const validateFilesChanged = (diff) => {
    if (!diff.length)
        throw "Error: empty pr"

    if (diff.length !== 1 || diff[0].from !== config.log_file_name || diff[0].to !== config.log_file_name) 
        throw new ChangeError("change must only touch README")
    
    return diff
}

const validateChangeContents = (diff, targetFileContents) => {
    const chunk = diff && diff[0] && diff[0].chunks[0]
    if (!chunk)
        throw new ChangeError("No differences with base branch")
    
    if (chunk.newLines > 0 || chunk.oldLines > 0)
        throw new ChangeError("Change must only add input at end of file")
    
    const lineCount = targetFileContents.split(/\r\n|\r|\n/).length
    if (chunk.newStart !== chunk.oldStart || chunk.newStart !== lineCount)
        throw new ChangeError("Change must only add input at end of file")
    
    if (chunk.changes.length !== 2)
        throw new ChangeError("Change must only add input at end of file")

    const add = chunk.changes.filter(x => x && x.type === 'add')
    if (add.length !== 1)
        throw new ChangeError("Change must only add input at end of file")
    
    const commandText = add[0].content.replace(/^\+\s*>?/, '')
    return command.parse(commandText)
}

const validatePullRequest = (prBranch, targetBranch) =>
    git(`diff -U0 ${targetBranch} ${prBranch}`)
        .then(parseDiff)
        .then(validateFilesChanged)
        .then(diff =>
            git(`show ${targetBranch}:${config.log_file_name}`).then(targetFileContents =>
                validateChangeContents(diff, targetFileContents)))

/**
 * 
 */
const tryRunCommand = (prBranch, targetBranch, command) =>
    git(`checkout -f ${targetBranch}`)
        .then(_ => git(`merge ${prBranch}`))
        .then(_ => game.iterate(command))
        .then(_ => git(`add ${config.log_file_name} ${config.save_file_name}`))
        .then(_ => git(`commit -m "> ${command.value}"`))

/**
 * 
 */
const tryMergePullRequest = (prBranch, targetBranch) =>
    validatePullRequest(prBranch, targetBranch)
        .then(command => tryRunCommand(prBranch, targetBranch, command))
        .then(result => {
            if (PUSH) {
                return git(`push origin ${targetBranch}`).then(_ => result)
            }
            return result
        })

/**
*/
const tryProcessPullRequest = (request) => {
    if (!request || !request.head || !request.head.repo || !request.base)
        return Promise.reject("Error getting pull request")

    const branchName = request.base.ref
    const otherCloneUrl = request.head.repo.clone_url
    const otherBranch = request.head.ref
    const sha = request.head.sha

    console.log('Processing ' + sha)

    if (!otherBranch.match(BRANCH_REGEXP) || !branchName.match(BRANCH_REGEXP))
        return Promise.reject("Invalid branch name")

    return checkoutPr(request.number)
        .then(prBranch => tryMergePullRequest(prBranch, branchName))
}

/**
    Process a single pull request
*/
const processPullRequest = (github, request) =>
    tryProcessPullRequest(request)
        .catch(err =>
            onPrError(github, request, err).then(_ => { throw err; }, _ => { throw err; }))

/**
 * Get a pull request pull 
 */
const getPullRequest = (github, owner, repo, number, noRetry) =>
    new Promise((resolve, reject) => {
        github.pullRequests.get({
            owner: owner,
            repo: repo,
            number: number
        }, (err, pullRequest) => {
            if (err) {
                if (noRetry)
                    return reject("Error getting pull request" + err)
                return handlePullRequest(github, user, repo, number, true)
            }
            return resolve(pullRequest)
        })
    })

/**
 * Attempt to handle a single pull request.
 */
const handlePullRequest = module.exports.handlePullRequest = (github, user, owner, repo, number, noRetry) =>
    getPullRequest(github, owner, repo, number)
        .then(pullRequest => processPullRequest(github, pullRequest))

