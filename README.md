# Zork.git

Zork.git is an experiment in using git to play a game, in this case, the classic interactive fiction title [Zork]. To start playing, simply [fork the zork.git game repo][game], enter a command by editing the `README`, and submit a PR back against the game repo.

Developed as part of [GitHub Game Off 2016](https://github.com/github/game-off-2016). [Offical Entry](https://github.com/mattbierner/game-off-2016)


### How it Works
The main [Zork.git repo][game] is where the game is played, with the `README` file used for game input and output. The starting `README` file looks something like this:

```
=== West of House | Score: 0 | Moves: 0 ===
West of House
You are standing in an open field west of a white house, with a boarded front door.
There is a small mailbox here.

> 
```

* The line with the `===` is the current game state: location, score, and number of moves
* Then comes the game output.
* And last is the input prompt `> `

You play the game by entering commands after the input prompt on the last line. Commands are submitted using pull requests on github, with a bot automatically merging in pull requests and updating the game state based on the input command.

Let's say you wanted to enter the command `go north`. Simply edit the `README` file's last line to be `> go north` and submit a PR with this change against the main game repo. If everything goes as expected, the PR will be merged automatically and the bot will update the `README` to contain:

```
=== West of House | Score: 0 | Moves: 0 ===
West of House
You are standing in an open field west of a white house, with a boarded front door.
There is a small mailbox here.

> go north


=== North of House | Score: 0 | Moves: 1 ===
North of House
You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees. 

> 
```

If you run into any issues, please [open a bug against the zork-client repo][issues] and not against the game repo.


> **💡 Hint**: Use Github's edit button on the `README` file to enter a command, automatically create a branch, and submit a PR, all entirely online.

.

> **❗ Important**: Anyone can submit changes to any branch/game. Plan accordingly :)

### Pull Request Requirements
A valid pull request must pass a few checks before being automatically merged in:

* Only touches the `README` file.
* The change itself only edits the last line of the `README` file, after the `> `
* The entered command must only contain letters, numbers, and a few simple punctuators.
* The request is made against a valid branch. `master` and any `game-*` branches are valid.

> **❗ Important**: If another PR is merged in before your PR targeting the same branch is processed, you must sync again to ensure your PR has no conflicts and meets all the above requirements. This is annoying, makes sense for this style of gameplay.

.

> **💡 Hint**: If you are having trouble submitting a change due to syncing problems, try creating a new branch and playing on it.


### Branch/Game Management
Two special commands are used to manage the game itself. These commands are submitted in the PR title, not through the `README`

* `@new BRANCHNAME` – Creates a new game on a new branch. The branch will be called `game-BRANCHNAME` and must not already exist.
* `@branch TO_BRANCH [FROM_BRANCH]` – Branches a game, creating a new branch to play on. The new branch will be called `game-TO_BRANCH`. If `FROM_BRANCH` is provided, the game is started from that games's current state. Otherwise, the game is branched from the target branch of the PR.

These special command pull requests do not become part of the commit history. They are used only to trigger branch creation. The standard z-machine game management commands (`save`, `restore`, ...) are not supported.

> **❗ Important**: Again, to create a new game using the Github online interface, edit the readme file in any manner and submit a PR with the title `@new BRANCHNAME`.


## Running
Given the nature of Zork.git, this repository only contains instructions for how to set up

### Prerequisites
Install the dumb version of `frotz`, `dfrotz`:

```bash
$ git clone https://github.com/DavidGriffith/frotz
$ cd frotz
$ make dumb
$ sudo make install_dumb
```

Install Node.js and [forever](https://github.com/foreverjs/forever):

```bash
$ npm install forever -g
````

### Project Setup
```bash
# Create empty directory to work in
$ mkdir zork 
$ cd zork

# Setup client/bot code
$ git clone git@github.com:art-dot-git/zork-client.git
$ cd zork-client
$ npm install
$ cd ..

# Setup an empty git repo for the game (you can also fork zork-dot-git if you want)
$ git init zork-dot-git
# If not forked, copy the files from https://github.com/art-dot-git/zork-dot-git/tree/4876beaba2c96cc5967b5025444db9a66268d947
# in to the repo. You need a zork z-machine game file, plus a README file with
# the initial output and a prompt.

# If not forked, create a `zork-dot-git` repo on Github and set it up
# as the main remote
$ cd zork-dot-git
$ git remote add origin git@github.com:MY_USER_NAME/zork-dot-git.git
```

The end result should look like:

```
zork/
    zork-client/    # Holds the client code from this repo
    zork-dot-git/   # A git repo for the game. Points to your Github repo as a remote. 
```

### Local Configuration
In `zork-client`, edit the `config.js` file to point to the correct locations. The main configuration options of interest are:

* `repo_organization` - The Github owner of the game repo.
* `repo_name` - The name of the game repo on Github.
* `new_game_commit` - The sha of the commit used for new games.
* `frotz_exe` – Path to `dfrotz` executable. Can be found with `$ which dfrotz`.

You can tweak the other configuration options to play a different game or change the behavior of the bot. 


### Github Configuration
The bot requires a [Personal Github Access Token](https://github.com/blog/1509-personal-api-tokens) to function.

Additionally, if you are running the bot as a server that automatically merges pull requests, you must setup a Github webook on the game repo that points to where the bot will be publically accessible. This webhook should send pull request events. 


### Running
The client code has two main scripts. 

The `index.js` script processes a single pull request:

```bash
node index.js --number 18 --token "GITHUB_TOKEN"
```

The `server.js` script starts a server to process pull requests

```bash
node server.js --number 18 --port 6910 --token "GITHUB_TOKEN" --secret "WEBHOOK_SECRET"
```

Use forever to launch `server.js` and keep it running:

```bash
forever start server.js --number 18 --port 6910 --token "GITHUB_TOKEN" --secret "WEBHOOK_SECRET"
```

If everything went as expected, PRs agains the game repo 




----

All credits for Zork goes to Tim Anderson, Marc Blank, Bruce Daniels, and Dave Lebling

[zork]: https://en.wikipedia.org/wiki/Zork
[game]: https://github.com/art-dot-git/zork-git
[issues]: https://github.com/art-dot-git/zork-client/issues