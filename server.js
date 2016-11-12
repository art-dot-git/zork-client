/**
    Webhook listener.
*/
"use strict"
const program = require("commander")
const http = require('http')
const main = require('./src/pull_request')
const seqqueue = require('seq-queue')
const githubClient = require('./src/github')

const config = require('./config')

// Pull request actions to process
const pullRequestActions = ['opened', 'synchronize', 'reopened']

const taskQueue = seqqueue.createQueue(30000)

program
    .version('0.0.0')
    .option('--port <port>', 'Port to listen on.')

    .option('--token <token>', 'Github user token')
    .option('--secret <secret>', 'Github hook secret')
    .parse(process.argv)

const port = (program.port || 3000)

const github = githubClient.getClient(program.token)


const webhookHandler = require('github-webhook-handler')({
    path: '/',
    secret: program.secret
})

webhookHandler.on('pull_request', (event) => {
    const action = event.payload.action
    if (pullRequestActions.indexOf(action) === -1) {
        console.log('ignoring action', action)
        return
    }
    taskQueue.push(
        (task) =>
            main.handlePullRequest(github, event.payload).then(
                _ => {
                    console.log("OK")
                    task.done()
                },
                (err) => {
                    console.error("ERROR", err)
                    task.done()
            }),
        () => {
            console.error("Timeout")
        })
})

console.log("Listening for webhook events on port", port)

http.createServer(function (req, res) {
    webhookHandler(req, res, (err) => {
        res.statusCode = 404
        res.end('')
    })
}).listen(port)
