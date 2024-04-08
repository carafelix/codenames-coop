import React from 'react';
import Color from '../utils/colors';

export class GameCardButton extends React.Component<{
  color: Color;
  marked: boolean;
  id: string;
  handleMarked: Function;
  word: string | null;
}> {
  render() {
    return (
      <button
        style={{
          backgroundColor: this.props.color,
          opacity: this.props.marked ? '20%' : '100%',
          color: this.props.color === '#000' ? '#ffffffee' : '#242424',
          textAlign: 'center',
        }}
        className="gameCard"
        id={this.props.id}
        onClick={() => {
          this.props.handleMarked(this.props.id);
        }}
      >
        {this.props.word || <>&nbsp;</>}
      </button>
    );
  }
}
