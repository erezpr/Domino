import React, { Component } from 'react';

import '../../styles/Statistics.css'

class Statistics extends Component {
    constructor() {
        super();
    }
    render() {
        let playerName;
        if (this.props.playerName === 'Your') {
            playerName = 'Yours'
        }
        else {
            playerName = this.props.playerName + "'s";
        }
        return (
            <React.Fragment>
                <h2>{playerName} Statistics</h2>
                <table className="StatisticsTable">
                    <tbody>
                        <tr>
                            <td>Average Turn Time:</td>
                            <td id="AvgTime">{this.props.averageTurnTime}</td>
                        </tr>
                        <tr>
                            <td>Number Of Stock Pulling:</td>
                            <td id="numberOfStockPulling">{this.props.numberOfStockPulling}</td>
                        </tr>
                        <tr>
                            <td>Move Number:</td>
                            <td id="moveNumber">{this.props.moveNumber}</td>
                        </tr>
                        <tr>
                            <td>Score:</td>
                            <td id="Score">{this.props.playerScore}</td>
                        </tr>
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}

export default Statistics;