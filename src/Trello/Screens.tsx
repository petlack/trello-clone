import Ripple from './Ripple';
import { IconRefresh } from './icons';
import './Screens.css';

export function LoadingScreen() {
  return (
    <div className="app screen">
      <div className="ripple">
        <Ripple />
      </div>
    </div>
  );
}

export function ErrorScreen({ refetch }: { refetch: () => void }) {
  return (
    <div className="app screen">
      <div className="card">
        <p>Unexpected error, please try again</p>
      </div>
      <div className="refresh" onClick={refetch}>
        {IconRefresh}
      </div>
    </div>
  );
}