import { LegacyRef } from 'react';
import { IconBoard } from '../icons';
import { Board } from '../types';

import './Board.css';

export type BoardProps = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
  board: Board;
  divProps: { [key: string]: any };
  divRef?: LegacyRef<HTMLDivElement> | undefined;
  divClassName: string;
};

export default function ({ children, board, divRef, divClassName, divProps }: BoardProps) {
  return (
    <div className="board">
      <div className="header">
        <div className="icon xsmall">{IconBoard}</div>
        <h3>{board.title}</h3>
      </div>
      <div ref={divRef} className={`tasks ${divClassName}`} {...divProps}>
        <>{children}</>
      </div>
    </div>
  );
}
