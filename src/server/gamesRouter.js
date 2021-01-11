const express = require('express');
const router = express.Router();
const auth = require('./auth');
const gameService = require('./gameService');


const gameList = [];

router.findGame = function (gameName) {
    for (game of gameList) {
        if (game.gameName === gameName) {
            return game;
        }
    }
    return null;
}

router.post('/addGame', auth.userAuthentication, (req, res) => {
    let gameJson = JSON.parse(req.body);

    for (game of gameList) {
        if (game.gameName === gameJson.gameName) {
            return res.status(403).send('game already exist');
        }
    }
    gameList.push({
        chatContent: [],
        gameOwner: auth.getUserInfo(req.session.id),
        gameName: gameJson.gameName,
        numberOfPlayers: gameJson.numberOfPlayers,
        numberOfRegisteredPlayers: 0,
        numberOfWatchingPlayers: 0,
        registeredPlayers: [],
        watchingPlayers: [],
        currentPlayerIndex: 0,
        isGameStarted: false,
        isActive: false,
        stock: [],
        boardTiles: []
    });

    res.sendStatus(200);
});

router.post('/deleteGame', auth.userAuthentication, (req, res) => {
    let gameIndex = gameService.getGameIndex(gameList, req.body);
    gameList.splice(gameIndex, 1);
    res.sendStatus(200);
});

router.post('/enterGame', auth.userAuthentication, (req, res) => {

    let game = router.findGame(req.body.gameName);
    if (req.body.isWatching === true) {
        game.numberOfWatchingPlayers++;
        game.watchingPlayers.push({playerName: (auth.getUserInfo(req.session.id))});
    }
    else {
        if (game.numberOfRegisteredPlayers === (game.numberOfPlayers - 1)) {
            game.isGameStarted = true;
            game.isActive = true;
            gameService.initialTiles(game);
        }

        game.numberOfRegisteredPlayers++;
        game.registeredPlayers.push({
            playerName: (auth.getUserInfo(req.session.id)),
            isActive: true,
            gameStatus: "",
            playerScore: 0
        });
    }
    return res.sendStatus(200);
});

router.get('/allGames', auth.userAuthentication, (req, res) => {
    res.json(gameList);
});

module.exports = router;