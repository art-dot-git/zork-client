/**
 * Resets the game
 */
const path = require('path')
const fs = require('fs')
const frotz = require('frotz-interfacer')

const parseCommand = require('./src/command').parse
const config = require('./config')
const exec = require('./src/evaluate').iterate

const removeFile = (path) =>
    fs.existsSync(path) && fs.unlinkSync(path)

/**
 * Cleanup any existing state
 */
const clearState = () => {
    removeFile(config.save_file)
    removeFile(config.log_file)
}

const writeInitialState = (logfile) => 
    exec({ type: 'input', value: 'reset' })
        .then(result => {
            fs.writeFileSync(logfile, config.new_game_header + '\n\n' + result + '\n\n> ')
            return result;
        })

clearState()
writeInitialState(config.log_file).then(x => console.log(x), x => console.error(x))