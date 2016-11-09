"use strict"
const program = require("commander")
const escapeRegexp = require('escape-string-regexp')

const config = require('./config')
const pathToRepo = require("path").join(__dirname, config.local_repository)

const git = require("git-promise")

/// Should error attempt to post error comments back to github.
const POST_COMMENTS = false

/**
    Handle pull request merge error.
*/
const onMergeError = (github, pullRequest, err, f) => {
    if (POST_COMMENTS) {
        return github.issues.createComment({
            user: config.user,
            repo: config.repo,
            number: pullRequest.number,
            body: `**AUTO MERGE ERROR**\nPlease try correcting the error below and updating the pull request\n\nIf this appears to be a system issue, [please open a bug](${REPO_URL}/issues).\n\n---------------------\n\n${err}`,
        }, () => f(err))
    } else {
        return f(err)
    }
}

/**
*/
const deleteBranch = name =>
    git(`branch -D ${name}`)

/**
*/
const verifyBranchMerge = (instance, branchName, f) => {
    console.log("Pre verify files changed", branchName)
    git(`diff --name-only branchName`).then(data => {
        console.log("Post verify files changed", branchName)

        const files = data.trim()
        if (files !== config.file_name && files.length !== 0) {
            return f(`Change must only touch README. [See guidelines](${ABOUT_URL}).`, null)
        }
        simpleGit._run(['show', branchName + ':' + config.file_name], (err, data) => {
            console.log("Post verify show", branchName, err)

            if (!err && isTextBlockGood(data)) {
                return f(null)
            } else {
                return f(`Text block is invalid. [See guidelines](${ABOUT_URL}).`)
            }
        })
    })
}

/**
    Force switch to the master branch.
*/
const forceCheckout = (branch, k) =>
    simpleGit._run(['checkout', '-f', branch], k)

/**
    Attempt to clean up a bad branch.
*/
const cleanUpBranch = (branchName, k) =>
    forceCheckout('master', err => {
        if (err) {
            k(err)
        } else {
            deleteBranch(branchName, k)
        }
    })

/**
    Attempt to update a branch with the latest changes.
*/
const getUpdatedBranch = (sha, branchName, cloneUrl, cloneBranch, k) =>
    forceCheckout('master', err => {
        if (err) {
            k(err)
        } else {
            console.log("Checking out", branchName, cloneUrl, cloneBranch)
            simpleGit._run(['checkout', '-B', branchName, 'master'], (err) => {
                console.log("Checked out", branchName, cloneUrl, cloneBranch)

                if (err) {
                    k(err)
                } else {
                    simpleGit._run(['pull', cloneUrl, cloneBranch], (err) => {
                        if (err) {
                            simpleGit
                                .add(config.file_name)
                                ._run(['commit', '-am', `"merge${sha}"`], e => k(e ? err : null))
                        } else {
                            k(err)
                        }
                    })
                }
            })
        }
    })

/**
*/
const tryMergeBranch = (branchName, k) =>
    verifyBranchMerge(simpleGit, branchName, (err, data) => {
        console.log("Pre merge", err)
        if (err) {
            return k(err)
        } else {
            return simpleGit._run(['merge', '-m "Automerge: ' + branchName + '"', branchName], (err, data) => {
                console.log("Post merge", err)
                k(err, data)
            })
        }
    })

/**
*/
const tryMergePullRequest = (request) => {
    if (!request || !request.head || !request.head.repo)
        return Promise.reject("Error getting pull request")

    const otherCloneUrl = request.head.repo.clone_url
    const otherBranch = request.head.ref
    const sha = request.head.sha
    const branchName = `auto-branch@${sha}`

    console.log('Processing ' + sha)

    if (!otherBranch.match(/^[a-z0-9\-_]+$/i)) {
        return Promise.reject("Invalid branch name")
    }

    return getUpdatedBranch(sha, branchName, otherCloneUrl, otherBranch, (err, data) => {
        console.log("Post branch update", err, data)
        if (err) {
            return f(err)
        }
        console.log("Pre verify")
        forceCheckout('master', err => {
            console.log("Post verify", err)
            if (err) {
                return f(err)
            }
            tryMergeBranch(branchName, (err) =>
                cleanUpBranch(branchName, () => {
                    if (err) {
                        return f(err)
                    }
                    console.log("Pre push", err)
                    return simpleGit.push('origin', 'master', (err, data) => {
                        console.log("post push", err)
                        return f(err, data)
                    })
                }))
        })
    })
}

/**
    Process a single pull request
*/
const processPullRequest = (github, request, k) =>
    tryMergePullRequest(request)
        .fail(err =>
            onMergeError(github, request, err).then(_ => { throw err; }, _ => { throw err; }))

/**
 * Get a pull request pull 
 */
const getPullRequest = (github, user, repo, number, noRetry) =>
    new Promise((resolve, reject) => {
        github.pullRequests.get({
            user: user,
            repo: repo,
            number: number
        }, (err, pullRequest) => {
            if (err) {
                console.log("Error getting pull request", err)
                if (noRetry)
                    return reject(err)
                return handlePullRequest(github, user, repo, number, true)
            }
            return resolve(pullRequest)
        })
    })

/**
 * Attempt to handle a single pull request.
 */
const handlePullRequest = module.exports.handlePullRequest = (github, user, repo, number, noRetry) =>
    getPullRequest(github, user, repo, number)
        .then(pullRequest => processPullRequest(github, pullRequest))

