import React, { Component } from 'react';
import Register from './Register.jsx';
import MainRoom from './MainRoom.jsx';

export default class BaseContainer extends Component { 
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            currentUser: {
                name: ''
            }
        };

        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);

        this.getUserName();
    }

    getUserName() {
        this.fetchUserInfo()
            .then(userInfo => {
                this.setState(() => ({ currentUser: userInfo, showLogin: false }));
            })
            .catch(err => {
                if (err.status === 401) { // incase we're getting 'unautorithed' as response
                    this.setState(() => ({ showLogin: true }));
                } else {
                    throw err; // in case we're getting an error
                }
            });
    }

    fetchUserInfo() {
        return fetch('/users', { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            });
    }

    handleSuccessedLogin() {
        this.setState(() => ({ showLogin: false }), this.getUserName);
    } 

    handleLoginError() {
        this.setState(() => ({ showLogin: true }));
    }

    logoutHandler() {
        fetch('/users/logout', { method: 'GET', credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    console.log(`failed to logout user ${this.state.currentUser.name} `, response);
                }
                this.setState(() => ({ currentUser: { name: '' }, showLogin: true }));
            })
    }

    renderMainRoom() {
        return (
            <MainRoom 
            logoutHandler={this.logoutHandler} 
            currentUserName={this.state.currentUser.name}
            showLogin={this.state.showLogin}/>
        )
    }

    render() {
        if (this.state.showLogin) {
            return (<Register
                loginSuccessHandler={this.handleSuccessedLogin}
                loginErrorHandler={this.handleLoginError}
            />)
        }
        return this.renderMainRoom();
    }
}