# WIP WIP WIP

# Zork.git

Zork.git is an experiment using git to play a game, in this case, the classic interactive fiction title [Zork]. To start playing, simply [fork the zork.git game repo][game], [enter a command]() by editing the `README`, and submit a PR back against the repo.

### How it Works
The main [Zork.git repo][game] is where the game is played, with the `README` file used for game input and output. The starting `README` file looks something like this:

```
=== West of House | Score: 0 | Moves: 0 ===
ZORK I: The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.
ZORK is a registered trademark of Infocom, Inc.
Revision 88 / Serial number 840726

West of House
You are standing in an open field west of a white house, with a boarded front door.
There is a small mailbox here.

> 
```

* The line with the `===` is the current game state: location, score, and number of moves
* Next comes the copyright text. This is only shown for new games.
* Then comes the game output.
* And last is the input prompt `> `

You play the game by entering commands after the input prompt on the last line. Commands are submitted using pull requests on github, with a bot automatically merging in pull requests and updating the game state based on the input command.

Let's say you wanted to enter the command `go north`. Simply edit the `README` file's last line to be `> go north` and submit a PR with this change against the main game repo. If everything goes as expected, the PR will be merged automatically and the bot will update the `README` to contain:

```
=== West of House | Score: 0 | Moves: 0 ===
ZORK I: The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.
ZORK is a registered trademark of Infocom, Inc.
Revision 88 / Serial number 840726

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


>**💡 Hint**: Use Github's edit button on the `README` file to enter a command, automatically create a branch, and submit a PR entirely online, without ever having to touch a command line.

> **❗ Important**: Anyone can submit changes to any branch/game. Plan accordingly :)

### Pull Request Requirements
A valid pull request must pass a few checks before being automatically merged in:

* Only touches the `README` file.
* The change itself only edits the last line of the `README` file, after the `> `
* The entered command must only contain letters, numbers, and a few simple punctuators.
* The request is made against a valid branch. `master` and any `game-*` branches are valid.

> **❗ Important**: If another PR is merged in before your PR targeting the same branch is processed, you must sync again to ensure your PR has no conflicts and meets all the above requirements. This is annoying, makes sense for this style of gameplay. 


### Branch/Game Management
Two special commands are used to manage the game itself. These commands are submitted in the PR title, not through the `README`

* `@new BRANCHNAME` – Creates a new game on a new branch. The branch will be called `game-BRANCHNAME` and must not already exist.
* `@branch TO_BRANCH [FROM_BRANCH]` – Branches a game, creating a new branch to play on. The new branch will be called `game-TO_BRANCH`. If `FROM_BRANCH` is provided, the game is started from that games's current state. Otherwise, the game is branched from the target branch of the PR.

These special command pull requests do not become part of the commit history. They are used only to trigger branch creation. The standard z-machine game management commands (`save`, `restore`, ...) are not supported.

> **❗ Important**: Again, to create a new game using the Github online interface, edit the readme file in any manner submit a PR with the title `@new BRANCHNAME`.


# Running the Code
This repo contains the Node.js implementation of the bot that handles pull requests. To get started:

```bash
cd zork-client
npm install
```

You also need to create a game repo. Try forking the [original change from the zork repo]() to get started.

```bash
git clone 
```

And edit the `config.js` file so that it points to the correct game repo locally and on github.


The `index.js` script processes a single PR

```bash
node index.js --number 18 --token "GITHUB_TOKEN"
```

The `server.js` script starts a server to process pull requests

```bash
node index.js --number 18 --token "GITHUB_TOKEN" --secret "WEBHOOK_SECRET"
```


----

All credits for Zork goes to Tim Anderson, Marc Blank, Bruce Daniels, and Dave Lebling

[zork]: https://en.wikipedia.org/wiki/Zork
[game]: https://github.com/art-dot-git/zork-git
[issues]: https://github.com/art-dot-git/zork-client/issues