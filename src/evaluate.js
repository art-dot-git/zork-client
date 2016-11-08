/**
 * Run a command against a frotz instance.
 */
const execCommand = module.exports.exec = (interfacer, command) =>
	new Promise((resolve, reject) =>
		interfacer.iteration(command.value, (error, output) => 
			error && error.error
				?reject(error.error)
				:resolve(output.pretty)))


