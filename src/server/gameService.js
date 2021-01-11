function initialTiles(game) {
    for (var i = 0; i <= 6; i++) {
        for (var j = 0; j <= 6 - i; j++) {
            game.stock.push({ x: i, y: j + i });
        }
    }
}

function getStartingTiles(game) {
    let playerTiles = [];
    for (let i = 0; i < 6; i++) {
        let x = Math.floor(Math.random() * game.stock.length);
        playerTiles[i] = game.stock[x];
        game.stock.splice(x, 1);
    };
    return playerTiles;
}

function addTileToBoard(game, tile) {
    game.boardTiles.push(tile);
    turnOver(game);
}

function getTileFromStock(game) {
    let x = Math.floor(Math.random() * game.stock.length);
    let tile = game.stock.splice(x, 1);
    return tile;
}

function turnOver(game) {
    if (game.currentPlayerIndex === (game.numberOfPlayers - 1))
        game.currentPlayerIndex = 0;
    else
        game.currentPlayerIndex++;
    if (game.isActive && game.registeredPlayers[game.currentPlayerIndex].isActive === false)
        turnOver(game);
}

function updateSurroundingsActivity(game, location, tileX, tileY) {
    let index = getBoardTileIndex(game, tileX, tileY);
    game.boardTiles[index].surroundings[location].isActive = false;
}

function getBoardTileIndex(game, x, y) {
    return game.boardTiles.findIndex((tile) => {
        return (tile.x === x && tile.y === y);
    });
}

function getPlayerIndex(players, playerName) {
    return players.findIndex((player) => {
        return (player.playerName.name === playerName);
    });
}

function getGameIndex(gamesList, gameName) {
    return gamesList.findIndex((game) => {
        return (game.gameName === gameName);
    });
}
function getNumberOfActivePlayers(registeredPlayers) {
    let countActivePlayers = 0;
    for (let i = 0; i < registeredPlayers.length; i++) {
        if (registeredPlayers[i].isActive === true) {
            countActivePlayers++;
        }
    }
    return countActivePlayers;
}

function isGameOverForAll(registeredPlayers) {
    let countGameOvers = 0;
    let numberOfActivePlayers = getNumberOfActivePlayers(registeredPlayers);
    for (let i = 0; i < registeredPlayers.length; i++) {
        if (game.registeredPlayers[i].gameStatus === "Nothing To Put") {
            countGameOvers++;
        }
    }

    return (countGameOvers == numberOfActivePlayers ? true : false);
}

function updatePlayersStatus(game) {
    let lowestScore = game.registeredPlayers[0].playerScore;
    let highestScore = game.registeredPlayers[0].playerScore;
    for (let i = 1; i < game.registeredPlayers.length; i++) {
        if (game.registeredPlayers[i].playerScore < lowestScore) {
            lowestScore = game.registeredPlayers[i].playerScore;
        }
        else if (game.registeredPlayers[i].playerScore > highestScore) {
            highestScore = game.registeredPlayers[i].playerScore;
        }
    }
    for (let i = 0; i < game.registeredPlayers.length; i++) {
        game.registeredPlayers[i].isActive = false;
        if (game.registeredPlayers[i].playerScore === lowestScore)
            game.registeredPlayers[i].gameStatus = "Win";
        else if (game.registeredPlayers[i].playerScore === highestScore)
            game.registeredPlayers[i].gameStatus = "You Lost";
        else
            game.registeredPlayers[i].gameStatus = "Second Place";
    }
}

function getActivePlayerIndex(registeredPlayers) {
    for (let i = 0; i < registeredPlayers.length; i++) {
        if (registeredPlayers[i].isActive === true) {
            return i;
        }
    }
    return -1;
}

function resetGame(game) {
    game.chatContent = [];
    game.registeredPlayers = [];
    game.currentPlayerIndex = 0;
    game.isGameStarted = false;
    game.isActive = false;
    game.stock = [];
    game.boardTiles = [];
}

module.exports = {
    turnOver,
    initialTiles,
    getStartingTiles,
    addTileToBoard,
    getTileFromStock,
    updateSurroundingsActivity,
    getPlayerIndex,
    getNumberOfActivePlayers,
    isGameOverForAll,
    updatePlayersStatus,
    getActivePlayerIndex,
    resetGame,
    getGameIndex
};
