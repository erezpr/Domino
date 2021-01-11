import React, { Component } from 'react';
import DominoTile from './DominoTile.jsx'
import '../../styles/PlayerLayout.css';

class PlayerLayout extends Component {
    constructor() {
        super();
    }

    renderTableData() {
        return this.props.playerTiles.map((tile, index) => {
            return (
                <DominoTile
                    id={this.props.id}
                    key={index}
                    tileX={tile.x}
                    tileY={tile.y}
                    style = "playerTile"
                    selectedTile={this.props.selectedTile}
                    onMouseOver={this.props.onMouseOver}
                    onPlayerPickTile={this.props.onPlayerPickTile} />
            )
        })
    }

    render() {
        return (
            <div className="PlayerLayout" >
                {this.renderTableData()}
            </div>
        );
    }
}

export default PlayerLayout;