import React from 'react'; 
import { createRoot } from 'react-dom/client';
import App from './app/App.tsx'; 
const container = document.getElementById('root');
const root = createRoot(container);

import './styles/index.css';

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);