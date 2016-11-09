const fs = require('fs')
const mdEscape = require('markdown-escape')
const moment = require('moment')

const formatResult = module.exports.formatResult = (result) => {
    if (!result || !result.length)
        return Promise.reject("Internal error: empty result")

    const head = `=== ${result[0]} ===`
    const body = result.slice(1).join('\n')
    return Promise.resolve(`${head}\n${body}`)
}

/**
 * Convert the results of an interation into an output string.
 */
const formatIteration = (input, result) =>
    formatResult(result).then(result => {
        const time = moment().format()
        return Promise.resolve(`> ${time} \\> ${input}` + '\n\n' + result + '\n\n\n')
    })

const appendResult = (logfile, resultText) =>
    new Promise((resolve, reject) =>
        fs.appendFile(logfile, resultText, err =>
            err ? reject('Output Error: ' + err) : resolve(resultText)))

/**
 * Write the result of an iteration to a file.
 */
const outputResult = module.exports.outputResult = (logfile, command, result) =>
    formatIteration(command, result)
        .then(appendResult.bind(null, logfile))
