import React, { Component } from 'react';

class TileSurroundings extends Component {
    constructor() {
        super();
        this.state = {
        };
        this.onPlayerPickPlace = this.onPlayerPickPlace.bind(this);
    }

    onPlayerPickPlace() {
        if (this.props.selectedTile !== undefined) {
            if (this.isValidMove(this.props.selectedTile)) {
                let location = this.getLocationIndex(this.props.location);
                this.props.updateSurroundingsActivity(location, this.props.tileX, this.props.tileY);
                this.props.onPlayerPickValidPlace(this.props.location);
            }
        }
    }

    getLocationIndex(location) {
        switch (location) {
            case 'left': return 0;
            case 'up': return 1;
            case 'right': return 2;
            case 'down': return 3;
        }
    }

    isValidMove(selectedTile) {
        let { nearNumber } = this.props;
        return (selectedTile !== undefined && (nearNumber === selectedTile.x || nearNumber === selectedTile.y)) ? true : false;
    }

    onPlayerSelectTile() {
        if (this.props.selectedTile !== undefined)
            return this.isValidMove(this.props.selectedTile) ? '2px solid green' : '2px solid red';
        else
            return '';
    }

    check() {
        this.props.countTileSurroundings();
        for (let i = 0; i < this.props.playerTiles.length; i++) {
            const playerTile = this.props.playerTiles[i];
            if (this.isValidMove(playerTile)) {
                this.props.addSurroundingStatus(true);
                return;
            }
        }
        this.props.addSurroundingStatus(false);
    }

    render() {
        this.check();
        return (
            <div
                onClick={this.onPlayerPickPlace}
                style={{
                    gridArea: `${this.props.gridArea}`,
                    border: this.onPlayerSelectTile()
                }} />
        );
    }
}
export default TileSurroundings;