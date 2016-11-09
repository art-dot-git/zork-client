const path = require('path')

const GAME_ROOT = path.join(__dirname, '../test')

module.exports = {
    frotz_exe: '../frotz/dfrotz',
    
    game_root: GAME_ROOT,
	game_file: path.join(GAME_ROOT, 'zork1.z5'),
	save_file: path.join(GAME_ROOT, 'zork1.dat'),
    log_file: path.join(GAME_ROOT, 'README'),

    special_prefix: '@@',

    new_game_header:
`Welcome [link](dsa)`,
    
    "user": "the-narrator",

    "repo_name": "art-z-test",
    "repo_organization": "mattbierner"
}