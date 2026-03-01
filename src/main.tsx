import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initPlatform, isTauri } from './platform';
import './styles/global.scss';

if (isTauri) {
  document.documentElement.setAttribute('data-tauri', '');
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

initPlatform().then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
