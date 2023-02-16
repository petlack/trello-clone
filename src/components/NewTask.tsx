import { useState } from 'react';
import { IconPlusCircleFill } from '../icons';

import './NewTask.css';

type NewTaskProps = {
  submit: (value: string) => void;
};

export default function ({ submit }: NewTaskProps) {
  const [value, setValue] = useState('');
  return (
    <div className="new-task">
      <input
        type="text"
        value={value}
        placeholder="Add task"
        enterKeyHint="send"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            submit(value);
            setValue('');
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          submit(value);
          setValue('');
        }}
      >
        <div className="icon small">{IconPlusCircleFill}</div>
      </button>
    </div>
  );
}
