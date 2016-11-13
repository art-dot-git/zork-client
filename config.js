const path = require('path')

// Local git repo for game
const GAME_ROOT = path.join(__dirname, '../zork-dot-git')
const log_file_name = "README"
const save_file_name = 'zork1.dat'

// Github repo for game
const repo_organization = "art-dot-git"
const repo_name = "zork-dot-git"

module.exports = {
    // Debugging
    post_comments: true,
    push: true,

    allow_all_users: true,
    allowed_users: ['mattbierner'],
    
    // Game
    frotz_exe: path.join(__dirname, '../frotz/dfrotz'),

    game_root: GAME_ROOT,
    game_file: path.join(GAME_ROOT, 'zork1.z5'),

    save_file_name: save_file_name,
    save_file: path.join(GAME_ROOT, save_file_name),

    log_file_name: log_file_name,
    log_file: path.join(GAME_ROOT, log_file_name),

    // Repo
    "issue_tracker_url": "https://github.com/art-dot-git/zork-client/issues",
    "about_url": "https://github.com/art-dot-git/zork-client",

    new_game_commit: "4876beaba2c96cc5967b5025444db9a66268d947",

    repo_name: repo_name,
    repo_organization: repo_organization,
    repo: `git@github.com:${repo_organization}/${repo_name}.git`,
    repo_url: `https://github.com/${repo_organization}/${repo_name}`
}