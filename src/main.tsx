import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { db } from './services/db';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', opacity: 0.7 }}>
    Loading...
  </div>
);

// Wait until data has been loaded from the database, then show the app
db.ready.then(() => {
  root.render(<App />);
});
