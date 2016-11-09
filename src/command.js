const MAX_COMMAND_LENGTH = 300
const COMMAND_REGEXP = /^[a-z0-9\-_\.\, ]+$/i

const MIN_BRANCH_NAME = 4
const MAX_BRANCH_NAME = 100
const BRANCH_REGEXP = /^[a-z0-9\-_\.]+$/i


/**
 * 
 */
const specialCommands = {
    new: (branchName) => {
        if (!branchName || branchName.length < MIN_BRANCH_NAME)
            throw 'Input Error: branch name too short'

        if (branchName.length > MAX_BRANCH_NAME)
            throw 'Input Error: branch name too long'

        if (!command.match(BRANCH_REGEXP))
            throw 'Input Error: branch name contains invalid characters'

        // Fresh game
        if (!targetName) {
            return { type: 'new', name: branchName }
        }

        if (!targetName.match(BRANCH_REGEXP))
            throw 'Input Error: target branch contains invalid characters'

        // Branch from existing games
        return { type: 'branch', name: branchName, from: targetName }
    }
}

/**
 * 
 */
const normalizeCommand = (input) =>
    input.trim().toLowerCase()

/**
 * 
 */
const getSpecialCommand = (input) => {
    if (input.indexOf('@@') !== 0)
        return null

    const components = input.slice(1).split(/\s+/g)
    const special = specialCommands[components[0]]
    return special && special.apply(null, components.slice(1))
}

/**
 * Get a valid command in standard form
 */
const parse = module.exports.parse = (input) =>
    new Promise(resolve => {
        const command = normalizeCommand(input)
        if (command.length > MAX_COMMAND_LENGTH)
            throw 'Input Error: Command too long'

        if (command.length === 0)
            throw 'Input Error: Empty command'

        if (!command.match(COMMAND_REGEXP))
            throw 'Input Error: Commond contains invalid characters'

        return resolve(getSpecialCommand(command) || { type: 'game', value: command })
    })
