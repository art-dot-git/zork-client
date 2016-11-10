const path = require('path')

const GAME_ROOT = path.join(__dirname, '../test')

const log_file_name = "README"
const save_file_name = 'zork1.dat'

module.exports = {
    frotz_exe: '../frotz/dfrotz',
    
    game_root: GAME_ROOT,
	game_file: path.join(GAME_ROOT, 'zork1.z5'),

    save_file_name: save_file_name,
	save_file: path.join(GAME_ROOT, save_file_name),

    log_file_name: log_file_name,
    log_file: path.join(GAME_ROOT, log_file_name),

    special_prefix: '@',

    new_game_header:
`Welcome [link](dsa)`,
    
    "issue_tracker_url": "https://github.com/art-dot-git/zork-client/issues",
    "about_url": "https://github.com/art-dot-git/zork-client",

    "user": "the-narrator",

    "repo_name": "art-z-test",
    "repo_organization": "mattbierner"
}