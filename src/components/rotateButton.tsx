import React from 'react';
import rotate90 from '../assets/rotate90.svg';

export const RotateButton: React.FC<{
  angle: number;
  rotateCurrentBoardHandler: Function;
}> = ({ angle, rotateCurrentBoardHandler }) => {
  return (
    <>
      <button className="rotateIcon" onClick={() => rotateCurrentBoardHandler}>
        <img
          datatype="hola"
          src={rotate90}
          alt="rotate symbol"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </button>
    </>
  );
};
