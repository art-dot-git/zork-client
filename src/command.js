const InputError = require('./input_error')

const MAX_COMMAND_LENGTH = 300
const COMMAND_REGEXP = /^@?[a-z0-9\-_\.\, \t]+$/i

const MIN_BRANCH_NAME = 4
const MAX_BRANCH_NAME = 100
const BRANCH_REGEXP = /^[a-z0-9\-_\.]+$/i

/**
 * Validates a user provided branch name
 */
const validateBranchName = (name) => {
    name = name.trim().toLowerCase();

    if (name.length < MIN_BRANCH_NAME)
        throw new InputError('branch name too short')

    if (name.length > MAX_BRANCH_NAME)
        throw new InputError('branch name too long')

    if (!command.match(BRANCH_REGEXP))
        throw new InputError('branch name may only contain letters, numbers, dash, and underscore')

    return name
}

/**
 * Lookup table for special (non-game) commands.
 */
const specialCommands = {
    new: (branchName) =>
        validateBranchName(branchName).then(name => ({
            type: 'new',
            name: branchName,
            value: "@new"
        })),

    branch: (from, to) =>
        validateBranchName(from).then(from =>
            validateBranchName(to).then(to => ({
                type: 'branch',
                from: from,
                to: to,
                value: "@branch"
            })))
}

/**
 * Check if a command is a special (non-game) command.
 */
const getSpecialCommand = (input) => {
    if (input.indexOf('@') !== 0)
        return null

    const components = input.slice(1).split(/\s+/g)
    const special = specialCommands[components[0]]
    if (!special)
        throw new InputError('Unknown command') 
    return special.apply(null, components.slice(1))
}

/**
 * Check if a command is a reserved command
 * 
 * This include special z-machine commands
 */
const isReserved = (command) =>
    command.match(/^(save|quit|reset|undo|restore)$/i)

/**
 * Normalize user command input. 
 */
const normalizeCommand = (input) =>
    input.trim().toLowerCase()

/**
 * Get a valid command in standard form
 */
const parse = module.exports.parse = (input) =>
    new Promise(resolve => {
        const command = normalizeCommand(input)
        if (command.length > MAX_COMMAND_LENGTH)
            throw new InputError('Command too long')

        if (command.length === 0)
            throw new InputError('Empty command')

        if (!command.match(COMMAND_REGEXP))
            throw new InputError('Command may only contain letters, numbers, and spaces')

        if (isReserved(command))
            throw new InputError(`'${command}' is not available`)

        return resolve(getSpecialCommand(command) || { type: 'input', value: command })
    })
