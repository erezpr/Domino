import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import DominoTile from './DominoTile.jsx';
import '../../styles/Board.css';
import '../../styles/DominoTileStyle.css';
import boardImage from '../../images/background.jpg';

class Board extends Component {
    constructor() {
        super();
    }

    renderTableData() {
        return this.props.boardTiles.map((tile, index) => {
            return (
                <DominoTile
                    key={index}
                    style="boardTile"
                    id={this.props.id}
                    tileX={tile.x}
                    tileY={tile.y}
                    row={tile.row}
                    column={tile.column}
                    surroundings={tile.surroundings}
                    tileDirection={tile.direction}
                    selectedTile={this.props.selectedTile}
                    updateSurroundingsActivity={this.props.updateSurroundingsActivity}  
                    onPlayerPickPlace={this.props.onPlayerPickPlace}
                    placeSelectedTileOnBoard={this.props.placeSelectedTileOnBoard}
                    playerTiles={this.props.playerTiles}
                    countTileSurroundings={this.props.countTileSurroundings}
                    addSurroundingStatus={this.props.addSurroundingStatus}
                />
            )
        })
    }

    

    componentDidMount() {
        const boardScroll = ReactDOM.findDOMNode(this.refs.boardScroll);
        boardScroll.scrollTo(650, 876);
        // boardScroll.scrollTo(320, 370);
    }

    render() {
        let { width, height, zoom } = this.props.boardDimension;

        return (
            <div ref="boardScroll" className='scrollContainer'>
                <div
                    className="Board"
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        gridTemplate: `repeat(auto-fill,${zoom}px)/repeat(auto-fill,${zoom}px)`,
                        backgroundImage: `url(${boardImage})`
                    }}>
                    {this.renderTableData()}
                </div>
            </div>
        );
    }
}

export default Board;