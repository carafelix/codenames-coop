import React from 'react';
import { GameCardButton } from './buttonCard';
import { boardProps } from '../app';

export class Board extends React.Component<
  boardProps,
  {
    words: string[];
    marked: any;
  }
> {
  constructor(props: boardProps) {
    super(props);
    this.state = {
      words: this.props.words,
      marked: {},
    };
  }

  render() {
    return (
      <div
        className={`board ${this.props.team}`}
        style={{
          display: 'grid',
          gap: '0.1em',
          gridTemplateColumns: 'repeat(5,min(120px,19vw))',
          gridTemplateRows: 'repeat(5,min(120px,19vw))'
        }}
      >
        {this.props.board.map((color, i) => {
          const strID = `${i},${this.props.board.toString()}`;
          let isMarked = false;
          if (this.props.marked?.[strID]) {
            isMarked = true;
          }
          return (
            <GameCardButton
              key={strID}
              id={strID}
              color={color}
              marked={isMarked}
              handleMarked={this.props.handleMarked}
              word={this.props.words[i]}
            />
          );
        })}
      </div>
    );
  }
}
