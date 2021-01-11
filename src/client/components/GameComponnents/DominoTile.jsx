import React, { Component } from 'react';
import I00 from '../../images/dominoTiles/0-0.png'
import I01 from '../../images/dominoTiles/0-1.png'
import I02 from '../../images/dominoTiles/0-2.png'
import I03 from '../../images/dominoTiles/0-3.png'
import I04 from '../../images/dominoTiles/0-4.png'
import I05 from '../../images/dominoTiles/0-5.png'
import I06 from '../../images/dominoTiles/0-6.png'
import I11 from '../../images/dominoTiles/1-1.png'
import I12 from '../../images/dominoTiles/1-2.png'
import I13 from '../../images/dominoTiles/1-3.png'
import I14 from '../../images/dominoTiles/1-4.png'
import I15 from '../../images/dominoTiles/1-5.png'
import I16 from '../../images/dominoTiles/1-6.png'
import I22 from '../../images/dominoTiles/2-2.png'
import I23 from '../../images/dominoTiles/2-3.png'
import I24 from '../../images/dominoTiles/2-4.png'
import I25 from '../../images/dominoTiles/2-5.png'
import I26 from '../../images/dominoTiles/2-6.png'
import I33 from '../../images/dominoTiles/3-3.png'
import I34 from '../../images/dominoTiles/3-4.png'
import I35 from '../../images/dominoTiles/3-5.png'
import I36 from '../../images/dominoTiles/3-6.png'
import I44 from '../../images/dominoTiles/4-4.png'
import I45 from '../../images/dominoTiles/4-5.png'
import I46 from '../../images/dominoTiles/4-6.png'
import I55 from '../../images/dominoTiles/5-5.png'
import I56 from '../../images/dominoTiles/5-6.png'
import I66 from '../../images/dominoTiles/6-6.png'
import '../../styles/DominoTileStyle.css';
import TileSurroundings from './TileSurroundings.jsx';

class DominoTile extends Component {
    constructor() {
        super();
        this.onPlayerPickValidPlace = this.onPlayerPickValidPlace.bind(this);
    }

    createTile() {
        let { id, tileX, tileY, row, column, style, onPlayerPickTile, tileDirection, selectedTile } = this.props;
        let imageUrl = this.getImageUrl();
        let styledDirection = this.getDirectionStyle(tileDirection);
        let tileBorder;

        if (this.props.selectedTile !== undefined && selectedTile.x === tileX && selectedTile.y === tileY)
            tileBorder = '0 -1px 4px #FFF, 0 -2px 10px #ff0, 0 -10px 20px #ff8000, 0 -18px 40px #F00'
        else
            tileBorder = '';


        switch (id) {
            case 'playerLayout':
                return (
                    <div
                        className={style}
                        onClick={() => { onPlayerPickTile(tileX, tileY) }}
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                            boxShadow: `${tileBorder}`
                        }} />);
            case 'board':
                return (
                    <React.Fragment>
                        <div
                            className={style + styledDirection}
                            style={{
                                backgroundImage: `url(${imageUrl})`,
                                gridArea: `${row}/${column}/span 4/span 2`
                            }} />
                        {this.getTileSurroundings()}
                    </React.Fragment>);
        }
    }

   

    getTileSurroundings() {
        return (
            this.props.surroundings.map((item, index) => {
                if (item.isActive) {
                    return <TileSurroundings
                        key={index}
                        updateSurroundingsActivity={this.props.updateSurroundingsActivity}
                        location={item.location}
                        tileX={this.props.tileX}
                        tileY={this.props.tileY}
                        nearNumber={this.getNearNumber(item.location)}
                        gridArea={this.getGridArea(item.location)}
                        selectedTile={this.props.selectedTile}
                        onPlayerPickValidPlace={this.onPlayerPickValidPlace}
                        playerTiles={this.props.playerTiles}
                        countTileSurroundings={this.props.countTileSurroundings}
                        addSurroundingStatus={this.props.addSurroundingStatus}
                    />
                }
            }));
    }

    onPlayerPickValidPlace(newTileLocation) {
        let row = this.getNewTileRow(newTileLocation);
        let column = this.getNewTileColumn(newTileLocation);
        let direction = this.getNewTileDirection(newTileLocation);
        let surroundings = this.getNewTileSurroundings(newTileLocation);

        this.props.placeSelectedTileOnBoard(row, column, direction, surroundings);
    }

    getNewTileRow(newTileLocation) {
        let { row, tileDirection } = this.props;
        let { x: newTileX, y: newTileY } = this.props.selectedTile;

        switch (newTileLocation) {
            case 'left':
            case 'right': return row;
            case 'up': return row + ((newTileX === newTileY) ? -3 : tileDirection === 'up' || tileDirection === 'down' ? -4 : -3);
            case 'down': return row + ((newTileX === newTileY) ? 3 : tileDirection === 'up' || tileDirection === 'down' ? 4 : 3);
        }
    }

    getNewTileColumn(newTileLocation) {
        let { column, tileDirection } = this.props;
        let { x: newTileX, y: newTileY } = this.props.selectedTile;

        switch (newTileLocation) {
            case 'left': return column + ((newTileX === newTileY) ? -3 : tileDirection === 'up' || tileDirection === 'down' ? -3 : -4);
            case 'right': return column + ((newTileX === newTileY) ? 3 : tileDirection === 'up' || tileDirection === 'down' ? 3 : 4);
            case 'up':
            case 'down': return column;
        }
    }

    getNewTileDirection(newTileLocation) {
        let { x: newTileX, y: newTileY } = this.props.selectedTile;
        let { tileX, tileY, tileDirection } = this.props;

        switch (newTileLocation) {
            case 'left': {
                if (newTileX !== newTileY)
                    switch (tileDirection) {
                        case 'up':
                        case 'down': return tileX === newTileX ? 'right' : 'left';
                        case 'left': return tileX === newTileX ? 'right' : 'left';
                        case 'right': return tileY === newTileY ? 'left' : 'right';
                    }
                else return tileDirection === 'up' || tileDirection === 'down' ? 'right' : 'up';
            }
            case 'right': {
                if (newTileX !== newTileY)
                    switch (tileDirection) {
                        case 'up':
                        case 'down': return tileX === newTileX ? 'left' : 'right';
                        case 'left': return tileY === newTileY ? 'right' : 'left';
                        case 'right': return tileX === newTileX ? 'left' : 'right';
                    }
                else return tileDirection === 'up' || tileDirection === 'down' ? 'right' : 'up';
            }
            case 'up': {
                if (newTileX !== newTileY)
                    switch (tileDirection) {
                        case 'up': return tileX === newTileX ? 'down' : 'up';
                        case 'down': return tileY === newTileY ? 'up' : 'down';
                        case 'left':
                        case 'right': return tileX === newTileX ? 'down' : 'up';
                    }
                else return tileDirection === 'up' || tileDirection === 'down' ? 'right' : 'up';
            }
            case 'down': {
                if (newTileX !== newTileY)
                    switch (tileDirection) {
                        case 'up': return tileY === newTileY ? 'down' : 'up';
                        case 'down': return tileX === newTileX ? 'up' : 'down';
                        case 'left':
                        case 'right': return tileX === newTileX ? 'up' : 'down';
                    }
                else return tileDirection === 'up' || tileDirection === 'down' ? 'right' : 'up';
            }
        }
    }

    getNewTileSurroundings(newTileLocation) {
        return [
            { location: 'left', isActive: newTileLocation === 'right' ? false : true },
            { location: 'up', isActive: newTileLocation === 'down' ? false : true },
            { location: 'right', isActive: newTileLocation === 'left' ? false : true },
            { location: 'down', isActive: newTileLocation === 'up' ? false : true },
        ]
    }

    getGridArea(SurroundingTileLocation) {
        return `${this.getSurroundingRow(SurroundingTileLocation)}/${this.getSurroundingColumn(SurroundingTileLocation)}/span 2/span 2`;
    }

    getSurroundingRow(SurroundingTileLocation) {
        let { tileDirection, row } = this.props;

        switch (SurroundingTileLocation) {
            case 'left': return row + 1;
            case 'up': return row + ((tileDirection === 'up' || tileDirection === 'down') ? -2 : -1);;
            case 'right': return row + 1;
            case 'down': return row + ((tileDirection === 'up' || tileDirection === 'down') ? 4 : 3);;
        }
    }

    getSurroundingColumn(SurroundingTileLocation) {
        let { tileDirection, column } = this.props;

        switch (SurroundingTileLocation) {
            case 'left': return column + ((tileDirection === 'up' || tileDirection === 'down') ? -2 : -3);;
            case 'up': return column;
            case 'right': return column + ((tileDirection === 'up' || tileDirection === 'down') ? 2 : 3);;
            case 'down': return column;
        }
    }

    getNearNumber(SurroundingTileLocation) {
        let { tileX, tileY, tileDirection } = this.props;

        switch (SurroundingTileLocation) {
            case 'left':
                switch (tileDirection) {
                    case 'up':
                    case 'down': return tileX === tileY ? tileX : -1;
                    case 'left': return tileX;
                    case 'right': return tileY;
                }
            case 'up':
                switch (tileDirection) {
                    case 'up': return tileX;
                    case 'down': return tileY;
                    case 'left':
                    case 'right': return tileX === tileY ? tileX : -1;
                }
            case 'right':
                switch (tileDirection) {
                    case 'up':
                    case 'down': return tileX === tileY ? tileX : -1;
                    case 'left': return tileY;
                    case 'right': return tileX;
                }
            case 'down':
                switch (tileDirection) {
                    case 'up': return tileY;
                    case 'down': return tileX;
                    case 'left':
                    case 'right': return tileX === tileY ? tileX : -1;
                }
        }
    }

    getDirectionStyle(direction) {
        switch (direction) {
            case 'up': return ' rotateUp';
            case 'left': return ' rotateLeft';
            case 'right': return ' rotateRight';
            case 'down': return ' rotateDown';
        }
    }

    getImageUrl() {
        let x = this.props.tileX;
        let y = this.props.tileY;

        switch (x) {
            case 0:
                switch (y) {
                    case 0: return I00;
                    case 1: return I01;
                    case 2: return I02;
                    case 3: return I03;
                    case 4: return I04;
                    case 5: return I05;
                    case 6: return I06;
                }
            case 1:
                switch (y) {
                    case 1: return I11;
                    case 2: return I12;
                    case 3: return I13;
                    case 4: return I14;
                    case 5: return I15;
                    case 6: return I16;
                }
            case 2:
                switch (y) {
                    case 2: return I22;
                    case 3: return I23;
                    case 4: return I24;
                    case 5: return I25;
                    case 6: return I26;
                }
            case 3:
                switch (y) {
                    case 3: return I33;
                    case 4: return I34;
                    case 5: return I35;
                    case 6: return I36;
                }
            case 4:
                switch (y) {
                    case 4: return I44;
                    case 5: return I45;
                    case 6: return I46;
                }
            case 5:
                switch (y) {
                    case 5: return I55;
                    case 6: return I56;
                }
            case 6:
                switch (y) {
                    case 6: return I66;
                }
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.createTile()}
            </React.Fragment>
        );
    }
}

export default DominoTile;