const fs = require('fs')
const mdEscape = require('markdown-escape')

/**
 * Convert the results of an interation into an output string.
 */
const formatResult = (input, result) => {
    if (!result || !result.length)
        return Promise.reject("Internal error: empty result")

    command = mdEscape(input)

    const escapedResult = result.map(mdEscape)
    const head = `**${escapedResult[0]}**`
    const body = escapedResult.slice(1).join('\n')
    return Promise.resolve('\\> ' + command + '\n' + head + '\n' + body + '\n\n')
}

const appendResult = (logfile, resultText) =>
    new Promise((resolve, reject) =>
        fs.appendFile(logfile, resultText, err =>
            err ? reject('Output Error: ' + err) : resolve(resultText)))

/**
 * Write the result of an iteration to a file.
 */
const outputResult = module.exports.outputResult = (logfile, command, result) =>
    formatResult(command, result)
        .then(appendResult.bind(null, logfile))
