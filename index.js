const path = require('path')
const frotz = require('frotz-interfacer')

const parseCommand = require('./src/command').parse
const outputResult = require('./src/output').outputResult
const exec = require('./src/evaluate').exec

const ROOT = __dirname

/**
 * 
 */
const iterate = (interfacer, logfile, input) =>
	parseCommand(input).then(command =>
		execCommand(interfacer, command)
			.then(result => outputResult(logfile, input, result)))

const interfacer = new frotz({
	executable: path.join(ROOT, '../frotz/dfrotz'),
	gameImage: path.join(ROOT, 'zork1.z5'),
	saveFile: path.join(ROOT, 'zork.dat'),
	outputFilter: frotz.filter
})

const logfile = path.join(ROOT, 'log.md')

iterate(interfacer, logfile, 'look. look')
	.catch(x => console.error(x))

