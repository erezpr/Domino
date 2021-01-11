import React, { Component } from 'react';
import Board from './Board.jsx';
import Statistics from './Statistics.jsx';
import PlayerLayout from './PlayerLayout.jsx';
import Chat from '../chatComponnents/chatContainer.jsx';
import '../../styles/Game.css';
import leftArrow from '../../images/leftArrow.gif'
import DominoStock from '../../images/DominoStock.png';
import playerTileBackground from '../../images/playerTileBackground.jpg'


class Game extends Component {
    constructor() {
        super();
        this.state = {
            boardDimension: { width: 2240, height: 2240, zoom: 10 },
            game: {},
            stock: [],
            boardTiles: [],
            playerTiles: [],
            surroundingsStatus: [],
            isMyTurn: true,
            isGameOver: false,
            isGameStart: false,
            isOponnentTurn: false,
            isGameFinished: false,
            isNeedToTakeFromStock: false,
            turnEndTime: undefined,
            selectedTile: undefined,
            turnStartTime: undefined,
            gameStartTimer: undefined,
            gameStatus: "",
            gameTime: '00:00',
            averageTurnTime: "00:00",
            quiteGameDisplay: '',
            playerScore: 0,
            numberOfMoves: 0,
            totalTurnTime: 0,
            numberOfUnValidMoves: 0,
            numberOfStockPulling: 0,
            numberOfTileSurrounding: 0
        };

        this.timeElapsed = this.timeElapsed.bind(this);
        this.onPlayerPickTile = this.onPlayerPickTile.bind(this);
        this.getNewTileFromStock = this.getNewTileFromStock.bind(this);
        this.addSurroundingStatus = this.addSurroundingStatus.bind(this);
        this.countTileSurroundings = this.countTileSurroundings.bind(this);
        this.placeSelectedTileOnBoard = this.placeSelectedTileOnBoard.bind(this);
        this.updateGameDetails = this.updateGameDetails.bind(this);
        this.showOtherPlayersStatistics = this.showOtherPlayersStatistics.bind(this);

        this.initGame = this.initGame.bind(this);
    }

    componentDidMount() {
        this.updateGameDetails();
        this.initGame();
    }

    componentWillUnmount() {
        clearInterval(this.state.timeInerval);
        this.state.componentWillUnmount = true;
    }

    componentDidUpdate() {
        if (!this.props.isWatching) {
            this.updateNumberOfValidMoves();
            this.updateAverageTurnTime();
            this.updatePlayerStatus();
            this.setPlayerScore();
            this.renderEndGameScreen();
            this.nullifySurroundingTiles();
        }
    }

    initGame() {
        if (this.state.componentWillUnmount !== true && !this.props.isWatching) {
            let gameName = this.props.game.gameName;
            if (this.state.game.isActive) {
                this.state.quiteGameDisplay = 'hidden';
                this.state.gameStartTimer = new Date().getTime();
                this.state.timeInerval = window.setInterval(this.timeElapsed, 100);
                this.setPlayerScore();

                fetch('/game/getStartingTiles', {
                    method: 'POST',
                    body: gameName,
                    credentials: 'include'
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw response;
                        }
                        return response.json();
                    })
                    .then(playerTiles => {
                        let gameStatus;
                        if (this.getCurrentPlayerTurnName() === this.props.playerName)
                            gameStatus = 'Start By Picking A Domino';
                        else
                            gameStatus = this.getCurrentPlayerTurnName() + "'s Turn";
                        this.setState(() => ({
                            playerTiles,
                            gameStatus
                        }));
                    })
                    .catch(err => { throw err });
            }
            else {
                this.setState(() => ({ gameStatus: 'Waiting for other participants...' }));
                this.timeoutId = setTimeout(this.initGame, 200);
            }
        }
    }

    updateGameDetails() {
        if (this.state.componentWillUnmount !== true) {
            let body;
            if (this.state.game.isGameStarted && !this.props.isWatching) {
                body = {
                    gameName: this.props.game.gameName,
                    playerName: this.props.playerName,
                    isWatching: this.props.isWatching,
                    gameStatus: this.state.gameStatus,
                    playerScore: this.state.playerScore
                };
            }
            else {
                body = {
                    gameName: this.props.game.gameName,
                    playerName: this.props.playerName,
                    isWatching: this.props.isWatching
                }
            }
            return fetch('/game/updateGameDetails', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
                .then((response) => {
                    if (!response.ok) {
                        throw response;
                    }
                    this.state.updateGameDetailsTimeoutId = setTimeout(this.updateGameDetails, 200);
                    return response.json();
                })
                .then(game => {
                    this.renderPlayerStatus();
                    this.setState(() => ({
                        game: game,
                        stock: game.stock,
                        boardTiles: game.boardTiles
                    }));
                })
                .catch(err => { throw err });
        }
    }

    updatePlayerStatus() {
        if (this.state.game.currentPlayerIndex > 0) {
            this.state.isGameStart = true;
        }
        if (this.state.isGameStart && this.state.game.isActive && !this.state.isGameOver) {
            if (this.getCurrentPlayerTurnName() === this.props.playerName) {
                if (this.state.playerTiles.length === 0) {
                    this.state.gameStatus = "Win";
                    this.state.quiteGameDisplay = '';
                    this.state.isGameOver = true;
                }
                else if (this.state.numberOfUnValidMoves !== this.state.numberOfTileSurrounding) {
                    this.state.isNeedToTakeFromStock = false;
                    this.state.gameStatus = "PUT DOMINO ON BOARD";
                }
                else if (this.state.stock.length !== 0) {
                    this.state.isNeedToTakeFromStock = true;
                    this.state.gameStatus = "TAKE DOMINO FROM STOCK";
                }
                else if (this.state.gameStatus !== "Start By Picking A Domino") {
                    this.state.gameStatus = "Nothing To Put";
                }
            }
            else if (!this.state.isGameOver) {
                this.state.gameStatus = this.getCurrentPlayerTurnName() + "'s Turn";
            }
        }
    }

    updateNumberOfValidMoves() {
        this.state.numberOfUnValidMoves = 0;
        for (let i = 0; i < this.state.surroundingsStatus.length; i++) {
            if (this.state.surroundingsStatus[i] === false) {
                this.state.numberOfUnValidMoves++;
            }
        }
    }

    updateAverageTurnTime() {
        if (this.state.game.isActive) {
            if (this.state.isMyTurn && this.getCurrentPlayerTurnName() === this.props.playerName) {
                this.state.turnStartTime = new Date().getTime();
                this.state.isMyTurn = false;
                this.state.isOponnentTurn = true;
            }
            else if (this.state.isOponnentTurn && this.getCurrentPlayerTurnName() !== this.props.playerName) {
                this.state.turnEndTime = new Date().getTime();
                this.state.totalTurnTime += this.state.turnEndTime - this.state.turnStartTime;
                this.state.isOponnentTurn = false;
                this.state.isMyTurn = true;
                this.setAverageTurnTime();
            }
        }
    }

    updatePlayerStatistics() {
        if (!this.props.isWatching) {
            let body = {
                averageTurnTime: this.state.averageTurnTime,
                numberOfStockPulling: this.state.numberOfStockPulling,
                numberOfMoves: this.state.numberOfMoves,
                playerScore: this.state.playerScore
            };

            fetch(`/game/updatePlayerStatistics/${this.state.game.gameName}`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
                .catch(err => { throw err });
        }
    }

    updateSurroundingsActivity(location, tileX, tileY) {
        let body = {
            gameName: this.props.game.gameName,
            location: location,
            tileX: tileX,
            tileY: tileY
        };

        fetch('/game/updateSurroundingsActivity', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .catch(err => { throw err });
    }

    onPlayerPickTile(x, y) {
        if (this.state.isGameOver === false && this.getCurrentPlayerTurnName() === this.props.playerName) {
            let playerLayoutIndex = this.getPlayerLayoutIndex(x, y);
            let row = Math.round((this.state.boardDimension.height / this.state.boardDimension.zoom) / 2);
            let column = Math.round((this.state.boardDimension.width / this.state.boardDimension.zoom) / 2);

            if (playerLayoutIndex !== -1) {
                if (this.state.boardTiles.length === 0) {
                    this.state.playerTiles.splice(playerLayoutIndex, 1);
                    let surroundings = [
                        { location: 'left', isActive: true },
                        { location: 'up', isActive: true },
                        { location: 'right', isActive: true },
                        { location: 'down', isActive: true }
                    ];

                    this.addTileToBoard(x, y, row, column, 'right', surroundings);

                    this.state.numberOfMoves++;
                    this.state.isGameStart = true;
                }
                else {
                    this.setState({ selectedTile: { x, y } })
                }
            }
        }
    }

    placeSelectedTileOnBoard(row, column, direction, surroundings) {
        let { x, y } = this.state.selectedTile;
        let playerTileIndex = this.getPlayerLayoutIndex(x, y);

        this.state.playerTiles.splice(playerTileIndex, 1);

        this.state.selectedTile = undefined;
        this.state.numberOfMoves++;
        this.addTileToBoard(x, y, row, column, direction, surroundings);
    }

    addTileToBoard(x, y, row, column, direction, surroundings) {
        let tile = {
            gameName: this.props.game.gameName,
            boardTile: { x, y, row, column, direction: direction, surroundings }
        };
        fetch('/game/addTileToBoard', {
            method: 'POST',
            body: JSON.stringify(tile),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .catch(err => { throw err });
    }

    getNewTileFromStock() {
        if ((this.state.isGameOver === false && this.state.isNeedToTakeFromStock === true && this.getCurrentPlayerTurnName() === this.props.playerName)) {
            if (this.state.stock.length !== 0) {
                let gameName = this.props.game.gameName;
                fetch('/game/getTileFromStock', {
                    method: 'POST',
                    body: gameName,
                    credentials: 'include'
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw response;
                        }
                        return response.json();
                    }).then(tile => {
                        this.state.playerTiles.push(tile);
                        this.setState({ playerTiles: this.state.playerTiles });
                    })
                    .catch(err => { throw err });
            }
            this.state.numberOfStockPulling++;
        }
    }

    getRegisteredPlayerIndex() {
        return this.state.game.registeredPlayers.findIndex((player) => {
            return (player.playerName.name === this.props.playerName);
        });
    }

    getNumberOfActivePlayers() {
        let registeredPlayers = this.state.game.registeredPlayers;
        let countActivePlayers = 0;
        for (let i = 0; i < registeredPlayers.length; i++) {
            if (registeredPlayers[i].isActive === true) {
                countActivePlayers++;
            }
        }
        return countActivePlayers;
    }

    getPlayerLayoutIndex(x, y) {
        return this.state.playerTiles.findIndex((tile) => {
            return (tile.x === x && tile.y === y);
        });
    }

    getCurrentPlayerTurnName() {
        return (this.state.game.registeredPlayers[this.state.game.currentPlayerIndex].playerName.name);
    }

    setPlayerScore() {
        let score = 0;
        for (let i = 0; i < this.state.playerTiles.length; i++) {
            let tile = this.state.playerTiles[i];
            score += tile.x + tile.y;
        }
        this.state.playerScore = score;
    }

    setAverageTurnTime() {
        let avgTimeInMilliseconds = (this.state.totalTurnTime / (this.state.numberOfMoves + this.state.numberOfStockPulling));
        var avgTime = this.convertTime(avgTimeInMilliseconds);
        this.state.averageTurnTime = avgTime;
    }

    addSurroundingStatus(status) {
        this.state.surroundingsStatus.push(status);
    }

    countTileSurroundings() {
        this.state.numberOfTileSurrounding++;
    }

    nullifySurroundingTiles() {
        this.state.surroundingsStatus = [];
        this.state.numberOfTileSurrounding = 0;
    }

    timeElapsed() {
        let elapsed = new Date().getTime() - this.state.gameStartTimer;
        let formatted = this.convertTime(elapsed);
        if (this.state.isGameOver === false) {
            this.setState({ gameTime: formatted });
        }
        else {
            this.setState({ gameStatus: this.state.gameStatus });
        }
    }

    convertTime(miliseconds) {
        let totalSeconds = Math.floor(miliseconds / 1000);
        let minutes = this.clockDisplay(Math.floor(totalSeconds / 60), 2);
        let seconds = this.clockDisplay(totalSeconds - minutes * 60, 2);
        return minutes + ':' + seconds;
    }

    clockDisplay(aNumber, aLength) {
        if (aNumber.toString().length >= aLength)
            return aNumber;
        return (Math.pow(10, aLength) + Math.floor(aNumber)).toString().substring(1);
    }

    showOtherPlayersStatistics() {
        if (this.state.game.isGameStarted && !this.state.game.isActive) {
            return this.state.game.registeredPlayers.map((player, index) => {
                if ((player.playerName.name != this.props.playerName || this.props.isWatching) && player.statistics !== undefined) {
                    return (<Statistics
                        key={index}
                        playerName={player.playerName.name}
                        averageTurnTime={player.statistics.averageTurnTime}
                        numberOfStockPulling={player.statistics.numberOfStockPulling}
                        moveNumber={player.statistics.numberOfStockPulling + player.statistics.numberOfMoves}
                        playerScore={player.statistics.playerScore}
                    />);
                }
            });
        }
    }

    showStatistics() {
        if (!this.props.isWatching) {
            return (<Statistics
                playerName={'Your'}
                averageTurnTime={this.state.averageTurnTime}
                numberOfStockPulling={this.state.numberOfStockPulling}
                moveNumber={this.state.numberOfStockPulling + this.state.numberOfMoves}
                playerScore={this.state.playerScore}
            />);
        }
    }

    showLeftArrow() {
        if (!this.props.isWatching && !this.state.isGameOver && this.state.isNeedToTakeFromStock && this.getCurrentPlayerTurnName() === this.props.playerName)
            return (<img className="leftArrow" src={leftArrow} />)
    }

    showTime() {
        if (!this.props.isWatching)
            return (<h2 id="time">{this.state.gameTime}</h2>);
    }

    renderChat() {
        if (this.state.game.isActive && !this.props.isWatching) {
            return (<Chat gameName={this.props.game.gameName} isGameStart={this.state.isGameStart} isActive={this.state.game.isActive} />);
        }
    }

    renderPlayerList(playersList) {
        if (this.state.game.registeredPlayers !== undefined && this.state.game.watchingPlayers !== undefined) {
            return playersList.map((player, index) => {
                let playerName;
                if (player.playerName.name === this.props.playerName)
                    playerName = 'You'
                else
                    playerName = player.playerName.name;
                if (!this.props.isWatching && player.playerName.name === this.getCurrentPlayerTurnName()) {
                    return (<li className='selected' key={index}><p>{playerName}</p></li>);
                }
                else
                    return (<li key={index}><p>{playerName}</p></li>);
            })
        }
    }

    renderPlayerStatus() {
        if (this.props.isWatching) {
            this.state.quiteGameDisplay = '';
            if (this.state.game.isActive && this.state.game.isGameStarted)
                this.state.gameStatus = this.getCurrentPlayerTurnName() + "'s Turn";
            else if (!this.state.game.isGameStarted)
                this.state.gameStatus = "Waiting for other participants...";
            else
                this.state.gameStatus = "Game Over";
        }
        else if (this.state.game.isGameStarted) {
            let thisPlayerIndex = this.getRegisteredPlayerIndex();
            let gameStatus = this.state.game.registeredPlayers[this.state.game.currentPlayerIndex].gameStatus;
            if (gameStatus === "Win" || gameStatus === "You Lost" || gameStatus === "Second Place") {
                this.state.gameStatus = this.state.game.registeredPlayers[thisPlayerIndex].gameStatus;
            }
        }
    }

    renderEndGameScreen() {
        if (this.state.isGameStart && !this.state.game.isActive) {
            this.state.isGameOver = true;
            this.state.quiteGameDisplay = '';
        }
        if (this.state.isGameStart && !this.state.game.isActive && !this.state.isGameFinished) {
            this.updatePlayerStatistics();
            this.state.isGameFinished = true;
        }
    }

    render() {
        return (
            <React.Fragment>
                <h1 className="title">{this.state.gameStatus}</h1>
                <button style={{ visibility: this.state.quiteGameDisplay }}
                    className="logout btn"
                    onClick={() => (this.updatePlayerStatistics(), this.props.quiteGameHandler(this.state.game.gameName, this.props.playerName))}>Quite Game</button>
                <div className="gameSection">
                    <div style={{ marginRight: "1vw" }}>
                        <div className="playersScroll">
                            <h2 className="turn">Players</h2>
                            <div className='playerList'>
                                <ol>
                                    {this.renderPlayerList(this.state.game.registeredPlayers)}
                                </ol>
                            </div>
                            <h2 className="turn">Watchers</h2>
                            <div className='playerList'>
                                <ol>
                                    {this.renderPlayerList(this.state.game.watchingPlayers)}
                                </ol>
                            </div>
                        </div>
                    </div>
                    <Board
                        id="board"
                        boardTiles={this.state.boardTiles}
                        selectedTile={this.state.selectedTile}
                        boardDimension={this.state.boardDimension}
                        playerTiles={this.state.playerTiles}
                        placeSelectedTileOnBoard={this.placeSelectedTileOnBoard}
                        countTileSurroundings={this.countTileSurroundings}
                        addSurroundingStatus={this.addSurroundingStatus}
                        updateSurroundingsActivity={(location, tileX, tileY) => this.updateSurroundingsActivity(location, tileX, tileY)}
                    />
                    <div style={{ marginLeft: "1vw" }}>
                        {this.showTime()}
                        <div className="statisticsScroll">
                            {this.showStatistics()}
                            {this.showOtherPlayersStatistics()}
                        </div>
                        {this.renderChat()}
                    </div>
                </div>

                <div className="footer" style={{ backgroundImage: `url(${playerTileBackground})` }}>
                    {this.showLeftArrow()}
                    <PlayerLayout
                        id="playerLayout"
                        selectedTile={this.state.selectedTile}
                        playerTiles={this.state.playerTiles}
                        onPlayerPickTile={this.onPlayerPickTile}
                    />
                </div>
                <img className="dominoStock" src={DominoStock} onClick={this.getNewTileFromStock} />
                {<h2 style={{ position: "fixed", bottom: 73 }}>{this.state.stock.length}</h2>}
            </React.Fragment>
        );
    }
}

export default Game;