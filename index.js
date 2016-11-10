/**
 * Command line pull request processor
 */
const program = require('commander')
const config = require('./config')
const githubClient = require('./src/github')
const main = require('./src/pull_request')

program
    .version('0.0.0')
    .option('--number <number>', 'Pull request to process')
    .option('--token <token>', 'Github user token')
    .parse(process.argv)

const github = githubClient.getClient(program.token)

main.handlePullRequest(github, config.user, config.repo_organization, config.repo_name, program.number)
	.then(_ => console.log(`Successfully processed ${program.number}`))
	.catch(e => console.log(`Error processing ${program.number} - ${e}`))
