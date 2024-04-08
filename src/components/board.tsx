import React from "react";
import { GameCardButton } from "./buttonCard";
import { boardProps } from "../app";

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
      <div className={`board ${this.props.team}`}>
        {this.props.board.map((element, i) => {
          const strID = `${this.props.board.flat().toString()},${i}`;
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