import React from 'react';
import { GameCardButton } from './buttonCard';
import { boardProps } from '../app';
import { chunk } from 'lodash';

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
        {
          // im quite sure this is a terrible practice
          (()=>{
            let board = chunk(this.props.board.map((color, i) => {
              const strID = `${i},${this.props.board.toString()}`;
              let isMarked = false;
              if (this.props.marked?.[strID]) {
                isMarked = true;
              }
              return <GameCardButton
                        key={strID}
                        id={strID}
                        color={color}
                        marked={isMarked}
                        handleMarked={this.props.handleMarked}
                        word={this.props.words[i]}
                      />
            }),5)
            let times = this.props.rotate
            while(times){
              times--
              board = board[0].map((_, index) => board.map(row => row[row.length-1-index]));
            }
            return board.flat(Infinity)
          })()
        }
      </div>
    );
  }
}
