import { CSSProperties, LegacyRef } from 'react';
import { IconCross } from '../icons';
import { Task } from '../types';

import './Task.css';

type TaskProps = {
  task: Task
  remove: () => void
  divProps: { [key: string]: any }
  divStyle?: CSSProperties
  divRef?: LegacyRef<HTMLDivElement> | undefined
  divClassName: string
};

export default function ({ task, divProps, divStyle, divRef, divClassName, remove }: TaskProps) {
  return (
    <div
      className={`task ${divClassName}`}
      ref={divRef}
      {...divProps}
      style={divStyle}
    >
      <span className="description">
        {task.description}
      </span>
      <button
        type="button"
        onClick={remove}
      >
        {IconCross}
      </button>
    </div>
  );
};
