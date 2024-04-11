import React from 'react';
import rotate90 from '../assets/rotate90.svg';
import { angleStates } from '../app';

const parseAngle = {
  0: 0,
  1: 270,
  2: 180,
  3: 90
}

export const RotateButton: React.FC<{
  angleState: angleStates;
  rotateCurrentBoardHandler: Function;
}> = ({ angleState, rotateCurrentBoardHandler }) => {
  return (
    <>
      <button className="rotateIcon" onClick={() => rotateCurrentBoardHandler()}>
        <img
          src={rotate90}
          alt="rotate symbol"
          style={{ transform: `rotate(${parseAngle[angleState]}deg)`}}
        />
      </button>
    </>
  );
};
