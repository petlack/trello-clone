import { IconBoard } from './icons';
import { Board } from './types';

import './Board.css';

export type BoardProps = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
  board: Board
};

export default function({ children, board }: BoardProps) {
  return (
    <div className="board">
      <div className="header">
        <div className="icon xsmall">{IconBoard}</div>
        <h3>{board.title}</h3>
      </div>
      <>
        {children}
      </>
    </div>
  );
};