import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { isTauri } from './hooks/use_window';
import './styles/global.scss';

if (isTauri) {
  document.documentElement.setAttribute('data-tauri', '');
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
