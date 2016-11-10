# WIP WIP WIP

# Zork.git

Zork.git is a experiment in using git to play video games, in this case, the interactive fiction title [Zork]. To start playing, simply [fork the zork.git game repo][game], [enter a command]() by editing the `README`, and submit a PR back against the repo. 

### How it Works
The main [Zork.git repo][game] is where the game is played. The `README` file in this repo is used for both game input and output. The starting `README` file looks something like this:

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
* Next comes the copyright text. This is only shown once.
* Then comes the game output.
* And last is the input prompt `> `

You play the game by entering commands after the input prompt on the last line. The only difference here is that commands are submittied using pull requests on github, with a bot automatically merging the pull requests and updating the game state for the next iteration.

Let's say you wanted to enter the command `go north`. Simply edit the `README` file's last line to be `> go north` and submit a PR with this change against the main game repo. If everything goes as expected, the PR will be merged automatically and the bot will update the `README` to now show:


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

### Game Management
Games are played on branches of the main repo.



[zork]: https://en.wikipedia.org/wiki/Zork
[game: http://example.com
