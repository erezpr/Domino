const express = require('express');
const router = express.Router();
const auth = require('./auth');
const games = require('./gamesRouter');
const gameService = require('./gameService');

router.post('/updateGameDetails', (req, res) => {
    let game = games.findGame(req.body.gameName);
    if (game !== null && game.isActive) {
        let { playerName, gameStatus, playerScore, isWatching } = req.body;
        if (!isWatching) {
            playerIndex = gameService.getPlayerIndex(game.registeredPlayers, playerName);
            game.registeredPlayers[playerIndex].gameStatus = gameStatus;
            game.registeredPlayers[playerIndex].playerScore = playerScore;
            if (gameStatus === "Win")
                game.registeredPlayers[playerIndex].isActive = false;
            if (gameService.getNumberOfActivePlayers(game.registeredPlayers) === 1) {
                if (game.registeredPlayers.length === 3)
                    game.registeredPlayers[playerIndex].gameStatus = "Second Place";
                let loserIndex = gameService.getActivePlayerIndex(game.registeredPlayers);
                game.registeredPlayers[loserIndex].isActive = false;
                game.registeredPlayers[loserIndex].gameStatus = "You Lost";
                game.isActive = false;
            }
            else if (gameService.isGameOverForAll(game.registeredPlayers)) {
                gameService.updatePlayersStatus(game);
                game.isActive = false;
            }
            else if (game.stock.length === 0 && gameStatus === "Nothing To Put" &&
                game.registeredPlayers[game.currentPlayerIndex].playerName.name === playerName) {
                gameService.turnOver(game);
            }
        }
    }
    res.json(game);
});

router.post('/updatePlayerStatistics/:gameName', (req, res) => {
    let gameName = req.param('gameName');
    let game = games.findGame(gameName);
    let playerName = auth.getUserInfo(req.session.id).name;
    let playerIndex = gameService.getPlayerIndex(game.registeredPlayers, playerName);
    let player = game.registeredPlayers[playerIndex];
    player.statistics = req.body;
    res.sendStatus(200);
});

router.post('/quiteGame', (req, res) => {
    let playerJson = JSON.parse(req.body);
    let playerIndex;
    let game = games.findGame(playerJson.gameName);
    if (playerJson.isWatching === true) {
        playerIndex = gameService.getPlayerIndex(game.watchingPlayers, playerJson.playerName);
        game.watchingPlayers.splice(playerIndex, 1);
        game.numberOfWatchingPlayers--;
    }
    else {
        playerIndex = gameService.getPlayerIndex(game.registeredPlayers, playerJson.playerName);
        if (game.registeredPlayers[playerIndex].isActive === true) {
            game.registeredPlayers.splice(playerIndex, 1);
        }
        game.numberOfRegisteredPlayers--;
        if (game.numberOfRegisteredPlayers === 0) {
            gameService.resetGame(game);
        }

    }
    res.sendStatus(200);
});

router.post('/getStartingTiles', (req, res) => {
    let game = games.findGame(req.body);
    let initialTiles = gameService.getStartingTiles(game);
    res.json(initialTiles);
});

router.post('/addTileToBoard', (req, res) => {
    let game = games.findGame(req.body.gameName);
    gameService.addTileToBoard(game, req.body.boardTile);
    res.sendStatus(200);
});

router.post('/getTileFromStock', (req, res) => {
    let game = games.findGame(req.body);
    let tile = gameService.getTileFromStock(game);
    res.json(tile[0]);
});

router.post('/updateSurroundingsActivity', (req, res) => {
    let game = games.findGame(req.body.gameName);
    let { location, tileX, tileY } = req.body;
    gameService.updateSurroundingsActivity(game, location, tileX, tileY);
    res.sendStatus(200);
});

module.exports = router; 