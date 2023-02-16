import { IconPlusDotted } from '../icons';

import './NewBoard.css';

export default function ({ submit }: { submit: () => void }) {
  return (
    <div className="new-board">
      <div className="icon large" onClick={submit}>
        {IconPlusDotted}
      </div>
    </div>
  );
}
