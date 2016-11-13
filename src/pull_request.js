"use strict"
const gitPromise = require("git-promise")
const parseDiff = require('diffparser')
const mdEscape = require('markdown-escape')

const {postComment, closePr, getPullRequest} = require('./github')
const command = require('./command')
const game = require('./game_runner')
const config = require('../config')
const ChangeError = require('./change_error')
const InputError = require('./input_error')


const BRANCH_REGEXP = /^[a-z0-9\-_]{1,200}$/i

const gameBranchPrefix = 'game-'

/**
 * Execute a git command on the game repo.
 */
const git = (command) =>
    gitPromise(command, { cwd: config.game_root })

/**
 * 
 */
const getPrBranchName = number =>
    `pr-${number}`

/**
 * Get the url to view a branch
 */
const getBranchViewUrl = branchName =>
    `${config.repo_url}/tree/${branchName}#readme`

/**
 * 
 */
const getGameBranchName = name => {
    if (name === 'master')
        return name

    if (name.indexOf(gameBranchPrefix) === 0)
        return name

    return gameBranchPrefix + name
}

/**
 * 
 */
const isValidFromBranch = branchName =>
    branchName === 'master' || branchName.indexOf(gameBranchPrefix) === 0

/**
 * Handle an error with a pr
 */
const onPrError = (github, prNumber, error) =>
    postComment(github, prNumber,
        `**ERROR**

${mdEscape('' + error)}

---

Please correct the above error and update the pull request

* [More info](${config.about_url})
* [Report a system issue](${config.issue_tracker_url})
`)

/**
 * Checkout a pull request into its own branch
 */
const checkoutPr = number => {
    const name = getPrBranchName(number)
    return git(`fetch --update-head-ok origin pull/${number}/head:${name}`)
        .then(_ => git(`checkout -f ${name}`))
        .then(_ => git(`pull -f origin pull/${number}/head`))
        .then(_ => name)
        .catch(err => {
            throw `Error checking out PR #${number}: ${err}`
        })
}

/**
 * 
 */
const validateFilesChanged = (diff) => {
    if (!diff.length)
        throw new ChangeError("Empty pr")

    if (diff.length !== 1 || diff[0].from !== config.log_file_name || diff[0].to !== config.log_file_name)
        throw new ChangeError("Change must only touch README")

    return diff
}

/**
 * 
 */
const validateChangeContents = (diff, targetFileContents) => {
    const chunk = diff && diff[0] && diff[0].chunks[0]
    if (!chunk)
        throw new ChangeError("No differences with base branch")

    if (chunk.newLines > 0 || chunk.oldLines > 0)
        throw new ChangeError("Change must only add input at end of file (1)")

    const lineCount = targetFileContents.split(/\r\n|\r|\n/).length
    if (chunk.newStart !== chunk.oldStart || chunk.newStart !== lineCount)
        throw new ChangeError(`Change must only add input at end of file (2) { oldStart: ${chunk.oldStart}, newStart: ${chunk.newStart}, len: ${lineCount}}`)

    if (chunk.changes.length !== 2)
        throw new ChangeError("Change must only add input at end of file (3)")

    const add = chunk.changes.filter(x => x && x.type === 'add')
    if (add.length !== 1)
        throw new ChangeError("Change must only add input at end of file (4)")

    const commandText = add[0].content.replace(/^\+\s*>?/, '')
    return command.parse(commandText)
}

/**
 * 
 */
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
const validateTargetBranchNameForGameCommand = targetBranch => {
    if (isValidFromBranch(targetBranch))
        return Promise.resolve(targetBranch)
    return Promise.reject(new ChangeError('Pull request must target a "game-*" branch'))
}

/**
 * 
 */
const tryRunGameCommand = (github, prNumber, prBranch, targetBranch, command) =>
    validateTargetBranchNameForGameCommand(targetBranch)
        .then(_ => git(`checkout -f ${targetBranch}`))
        .then(_ => git(`reset --hard origin/${targetBranch}`))
        .then(_ => git(`merge ${prBranch}`))
        .then(_ => game.iterate(command))
        .then(result =>
            git(`add ${config.log_file_name} ${config.save_file_name}`)
                .then(_ => git(`commit -m "> ${command.value}"`))
                .then(result => {
                    if (config.push)
                        return git(`push origin ${targetBranch}`).then(_ => result)
                    return result
                })
                .then(_ => postComment(github, prNumber, `**SUCCESS**: [${targetBranch}](${getBranchViewUrl(targetBranch)})\n\n\\> ${mdEscape(command.value)}\n\n ${mdEscape(result)}`)))

/**
 * 
 */
const tryCreateBranch = (github, prNumber, from, to) =>
    git(`git ls-remote --heads ${config.repo} ${to}`)
        .then(found => {
            if (found.trim().length)
                throw `Target branch '${to}' already exists`

            if (from === to)
                throw 'Same branches'

            return to
        })
        .then(_ => git(`checkout -B ${to} ${from}`).fail(_ => { throw "branch creation failed"; }))
        .then(result => {
            if (config.push)
                return git(`push origin ${to}`).then(_ => result)
            return result
        })
        .then(_ => postComment(github, prNumber, `**SUCCESS**\n\nCreated new game branch [${to}](${getBranchViewUrl(to)})`))
        .then(_ => closePr(github, prNumber, from))

/**
 * 
 */
const tryRunBranchCommand = (github, prNumber, from, to) => {
    from = getGameBranchName(from)
    if (!isValidFromBranch(from))
        throw new InputError('Invalid branch')

    return git(`git ls-remote --heads ${config.repo} ${from}`)
        .then(found => {
            if (!found.trim().length)
                throw `No such branch found '${from}'`
            return from
        })
        .then(_ => tryCreateBranch(github, prNumber, from, getGameBranchName(to)))
}

/**
 * 
 */
const tryRunNewCommand = (github, prNumber, to) =>
    tryCreateBranch(github, prNumber, config.new_game_commit, getGameBranchName(to))

/**
 * 
 */
const tryRunCommand = (github, prNumber, prBranch, targetBranch, command) => {
    switch (command.type) {
        case 'input':
            return tryRunGameCommand(github, prNumber, prBranch, targetBranch, command)

        case 'new':
            return tryRunNewCommand(github, prNumber, command.to)

        case 'branch':
            return tryRunBranchCommand(github, prNumber, command.from || targetBranch, command.to)
    }
    throw "Unknown command type"
}

/**
 * 
 */
const tryMergePullRequest = (github, prNumber, prBranch, targetBranch) =>
    validatePullRequest(prBranch, targetBranch)
        .then(command => tryRunCommand(github, prNumber, prBranch, targetBranch, command))

/**
 * Attempt to handle a single pull request object.
 */
const processPullRequest = (github, request) => {
    if (!request || !request.head || !request.head.repo || !request.base)
        return Promise.reject("Error getting pull request")

    if (request.state !== 'open') {
        console.log(`Not processing non-open pr ${request.number}`)
        return Promise.resolve('')
    }

    // Check auth
    const user = request.user && request.user.login
    if (!config.allow_all_users) {
        if (config.allowed_users.indexOf(user) === -1) {
            return Promise.reject('Unauthorized user. Contact @mattbierner to get authorized for beta testing or wait for offical release')
        }
    }

    const targetBranch = request.base.ref
    const otherBranch = request.head.ref
    const sha = request.head.sha

    console.log('Processing ' + sha)

    if (!otherBranch.match(BRANCH_REGEXP) || !targetBranch.match(BRANCH_REGEXP))
        return Promise.reject("Invalid branch name")

    // Check to see if this is a special command
    return command.getSpecialCommand(request.title).then(special => {
        if (special)
            return tryRunCommand(github, request.number, null, targetBranch, special)

        return git(`checkout -f ${targetBranch}`)
            .then(_ => git(`pull origin ${targetBranch}`))
            .then(_ => checkoutPr(request.number))
            .then(prBranch => tryMergePullRequest(github, request.number, prBranch, targetBranch))
    })
}

/**
 * Attempt to handle a single pull request.
 */
const handlePullRequest = module.exports.handlePullRequest = (github, pullRequest) =>
    processPullRequest(github, pullRequest)
        .catch(err =>
            onPrError(github, pullRequest.number, err).then(_ => { throw err }, _ => { throw err }))


/**
 * Attempt to handle a single pull request by number.
 */
const handlePullRequestNumber = module.exports.handlePullRequestNumber = (github, prNumber) =>
    getPullRequest(github, prNumber)
        .then(pullRequest => handlePullRequest(github, pullRequest))

