import React from 'react';
import { GameCardButton } from './buttonCard';
import { boardProps } from '../app';

export class Board extends React.Component<
  boardProps,
  {
    marked: any;
  }
> {
  constructor(props: boardProps) {
    super(props);
    this.state = {
      marked: {},
    };
  }

  render() {
    return (
      <div
        className={`board ${this.props.team}`}
        style={{
          display: 'grid',
          gap: '0.3em',
          gridTemplateColumns: 'repeat(5,120px)',
          gridTemplateRows: 'repeat(5,120px)',
        }}
      >
        {this.props.board.map((element, i) => {
          const strID = `${i},${this.props.board
            .map((v) => v.color)
            .toString()}`;
          let isMarked = false;
          if (this.props.marked?.[strID]) {
            isMarked = true;
          }
          return (
            <GameCardButton
              key={strID}
              id={strID}
              color={element.color}
              marked={isMarked}
              handleMarked={this.props.curry}
              word={element.word}
            />
          );
        })}
      </div>
    );
  }
}
