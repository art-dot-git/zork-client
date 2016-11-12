const path = require('path')

const GAME_ROOT = path.join(__dirname, '../test')

const log_file_name = "README"
const save_file_name = 'zork1.dat'

const repo_name = "art-z-test"
const repo_organization = "mattbierner"

module.exports = {
    // Debugging
    post_comments: false,
    allow_all_users: false,
    allowed_users: ['mattbierner', 'greyepoxy'],
    
    // game
    frotz_exe: '../frotz/dfrotz',

    game_root: GAME_ROOT,
    game_file: path.join(GAME_ROOT, 'zork1.z5'),

    save_file_name: save_file_name,
    save_file: path.join(GAME_ROOT, save_file_name),

    log_file_name: log_file_name,
    log_file: path.join(GAME_ROOT, log_file_name),

    // Repo
    "issue_tracker_url": "https://github.com/art-dot-git/zork-client/issues",
    "about_url": "https://github.com/art-dot-git/zork-client",

    new_game_commit: "f8f53aee2e56019f7d17eafab0e969659eadb0a5",

    user: "the-gamemaster",
    repo_name: repo_name,
    repo_organization: repo_organization,
    repo: `git@github.com:${repo_organization}/${repo_name}.git`,
    repo_url: `https://github.com/${repo_organization}/${repo_name}`
}