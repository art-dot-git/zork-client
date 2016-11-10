const fs = require('fs')
const frotz = require('frotz-interfacer')
const config = require('../config')

/**
 * 
 */
const formatResult = module.exports.formatResult = (result) => {
    if (!result || !result.length)
        return Promise.reject("Internal error: empty result")

    const head = `=== ${result[0]} ===`
    const body = result.slice(1).join('\n')
    return Promise.resolve(`${head}\n${body}`)
}

/**
 * Run a command against the saved game state. 
 */
const exec = (command) => {
	if (command.type !== 'input')
		throw 'invalid command type' 

	const interfacer = new frotz({
		executable: config.frotz_exe,
		gameImage: config.game_file,
		saveFile: config.save_file,
		outputFilter: frotz.filter
	})

	return new Promise((resolve, reject) =>
		interfacer.iteration(command.value, (error, output) => 
			error && error.error
				?reject(error.error, interfacer)
				:resolve(output.pretty, interfacer)))
		 .then(formatResult)
}

/**
 * Run a command against the saved game state and write the results to the log file.
 */
const iterate = module.exports.iterate = (command) =>
	exec(command).then(result => {
		fs.appendFileSync(config.log_file, '\n\n' + result + '\n\n> ')
		return result
	})
