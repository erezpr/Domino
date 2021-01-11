import React, { Component } from 'react';
import Game from './GameComponnents/Game.jsx';
import '../styles/style.css'

class MainRoom extends Component {
    constructor() {
        super();
        this.state = {
            users: {},
            currentGame: {},
            games: [],
            showGame: false,
            isWatching: false,
            isFirstUpdate: true,
            renderErrorMessage: ""
        }
        this.getAllUsers = this.getAllUsers.bind(this);
        this.addGame = this.addGame.bind(this);
        this.mapObject = this.mapObject.bind(this);
        this.getAllGames = this.getAllGames.bind(this);
        this.quiteGameHandler = this.quiteGameHandler.bind(this);
        this.renderOnlineUsersRows = this.renderOnlineUsersRows.bind(this);
    }

    componentDidUpdate() {
        if (!this.state.showGame && this.state.isFirstUpdate) {
            this.getAllGames();
            this.getAllUsers();
            this.state.isFirstUpdate = false;
        }
    }

    componentWillUnmount() {
        if (this.timeoutId)
            clearTimeout(this.timeoutId);

        if (this.state.AllGamesTimeoutId)
            clearTimeout(this.state.AllGamesTimeoutId);

        if (this.state.getAllUsersTimeoutId)
            clearTimeout(this.state.getAllUsersTimeoutId);

    }

    addGame(e) {
        e.preventDefault();
        let obj = {
            gameName: e.target.elements.gameName.value,
            numberOfPlayers: e.target.elements.numberOfPlayers.value
        };

        let json = JSON.stringify(obj);

        fetch('/games/addGame', { method: 'POST', body: json, credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    this.setState(() => ({ errMessage: "" }));
                } else if (response.status === 403) {
                    this.setState(() => ({ errMessage: "Game name already exist, please try another one" }));
                }
            });
        return false;
    }

    enterGame(game) {
        let body = {
            gameName: game.gameName,
            isWatching: this.state.isWatching
        };

        return fetch('/games/enterGame',
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    this.setState({
                        currentGame: game,
                        showGame: true
                    });
                }
            });
    }

    deleteGame(game) {
        return fetch('/games/deleteGame', { method: 'POST', body: game.gameName, credentials: 'include' })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
            })
            .catch(err => { throw err });
    }

    getAllGames() {
        if (!this.state.showGame && !this.props.showLogin) {
            return fetch('/games/allGames', { method: 'GET', credentials: 'include' })
                .then((response) => {
                    if (!response.ok) {
                        throw response;
                    }
                    this.state.AllGamesTimeoutId = setTimeout(this.getAllGames, 500);
                    return response.json();
                })
                .then(games => {
                    this.setState(() => ({ games }));
                })
                .catch(err => { throw err });
        }
    }

    getAllUsers() {
        if (!this.state.showGame && !this.props.showLogin) {
            return fetch('/users/allUsers', { method: 'GET', credentials: 'include' })
                .then((response) => {
                    if (!response.ok) {
                        throw response;
                    }
                    this.state.getAllUsersTimeoutId = setTimeout(this.getAllUsers, 500);
                    return response.json();
                })
                .then(users => {
                    this.setState(() => ({ users }));
                })
                .catch(err => { throw err });
        }
    }

    quiteGameHandler(gameName, playerName) {
        let obj = {
            gameName: gameName,
            playerName: playerName,
            isWatching: this.state.isWatching
        };

        let json = JSON.stringify(obj);
        fetch('/game/quiteGame', { method: 'POST', body: json, credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    console.log(`failed to quite user ${this.props.currentUserName} `, response);
                }
                else {
                    this.setState({
                        showGame: false
                    });
                }
            });
    }

    mapObject(object, callback) {
        return Object.keys(object).map(function (key) {
            return callback(key, object[key]);
        });
    }

    isEnterable(game) {
        return (this.state.isWatching || !game.isGameStarted) ? false : true;
    }

    isDeleteable(game) {
        return (game.numberOfRegisteredPlayers === 0 && game.gameOwner.name === this.props.currentUserName ? false : true)
    }

    renderOnlineUsersRows(key, value) {
        if (this.props.currentUserName === value)
            return <tr key={key}><td>You</td></tr>;
        else
            return <tr key={key}><td>{value}</td></tr>;
    }

    renderOnlineUsersTable() {
        return (<table className="onlineUsers">
            <thead>
                <tr>
                    <th>Online Users</th>
                </tr>
            </thead>
            <tbody>
                {this.mapObject(this.state.users, this.renderOnlineUsersRows)}
            </tbody>
        </table>);
    }

    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <label style={{ color: 'red' }}>
                    {this.state.errMessage}
                </label>
            );
        }
        return null;
    }

    renderGamesTable() {
        if (this.state.games.length === 0) {
            return (<h2 style={{ color: 'white' }}>No Game Has Been Created Yet</h2>);
        }
        else {
            return (<table className="gamesTable">
                <thead>
                    <tr>
                        <th>Game Name</th>
                        <th>Game Creator</th>
                        <th>Required Number Of Players</th>
                        <th>Registered Players</th>
                        <th>Watching Players</th>
                        <th>Game Activeness</th>
                        <th>Game Deletion</th>
                        <th>Game Entry</th>
                    </tr>
                </thead>
                <tbody>{this.renderGames()}</tbody>
            </table>);
        }
    }

    renderGames() {
        return this.state.games.map((game, index) => {
            let gameStatus = 'Not Active';
            if (game.isActive)
                gameStatus = 'Active'
            return (
                <tr key={index}>
                    <td>{game.gameName}</td>
                    <td>{game.gameOwner.name}</td>
                    <td>{game.numberOfPlayers}</td>
                    <td>{game.numberOfRegisteredPlayers}</td>
                    <td>{game.numberOfWatchingPlayers}</td>
                    <td>{gameStatus}</td>
                    <td><button
                        onClick={() => this.deleteGame(game)}
                        disabled={this.isDeleteable(game)}>Delete Game</button></td>
                    <td><button
                        onClick={() => this.enterGame(game)}
                        disabled={this.isEnterable(game)}>Enter Game</button></td>
                </tr>
            );
        })
    }

    render() {
        if (this.state.showGame) {
            this.state.isFirstUpdate = true;
            return (<Game
                game={this.state.currentGame}
                playerName={this.props.currentUserName}
                isWatching={this.state.isWatching}
                quiteGameHandler={this.quiteGameHandler} />)
        }
        else {
            return (
                <React.Fragment>
                    <h1>Hello {this.props.currentUserName}</h1>
                    <button
                        className="logout btn"
                        onClick={() => this.props.logoutHandler()}>Logout</button>
                    <div style={{ display: 'Flex' }}>

                    </div>
                    {this.renderOnlineUsersTable()}
                    <form onSubmit={this.addGame} style={{ margin: '20px' }}>
                        <label className="username-label" htmlFor="GameName"> Game Name: </label>
                        <input className="username-input" name="gameName" defaultValue="game1" />
                        <label className="username-label" htmlFor="GameName" />
                        <label>Number Of Players:</label>
                        <label><input type="radio" value="2" name="numberOfPlayers" defaultChecked />2</label>
                        <label><input type="radio" value="3" name="numberOfPlayers" />3</label>
                        <input className="submit-btn btn" type="submit" value="Add Game" />
                        {this.renderErrorMessage()}
                        <div><p><label>Watch Other's Games Mode:
                        <input
                                type="checkbox"
                                checked={this.state.isWatching}
                                onChange={() => { this.setState({ isWatching: !this.state.isWatching }) }} /></label></p></div>
                    </form>
                    {this.renderGamesTable()}
                </React.Fragment>
            );
        }
    }
}

export default MainRoom;