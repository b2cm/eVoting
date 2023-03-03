import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
/* In development mode  StrictMode intentionally remount the components to help you find bugs.
This effect is not applied in production mode.
<React.StrictMode>
    <App />
  </React.StrictMode>
*/

root.render(
  <App />
);
