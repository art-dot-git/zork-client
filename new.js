/**
 * Resets the game
 */
const path = require('path')
const fs = require('fs')
const frotz = require('frotz-interfacer')

const parseCommand = require('./src/command').parse
const output = require('./src/output')
const config = require('./config')
const exec = require('./src/evaluate').exec

const removeFile = (path) =>
    fs.existsSync(path) && fs.unlinkSync(path)

/**
 * Cleanup any existing state
 */
const clearState = () => {
    removeFile(config.save_file)
    removeFile(config.log_file)
}

const writeInitialState = (logfile) => {
    const interfacer = new frotz({
        executable: config.frotz_exe,
        gameImage: config.game_file,
        saveFile: config.save_file,
        outputFilter: frotz.filter
    })

    return exec(interfacer, { type: 'input', value: 'reset' })
            .then(output.formatResult)
            .then(result => {
                fs.writeFileSync(logfile, config.new_game_header + '\n\n' + result + '\n\n > ')
                return result;
            })
}



clearState()
writeInitialState(config.log_file).then(x => console.log(x), x => console.error(x))