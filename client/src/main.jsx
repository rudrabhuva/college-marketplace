import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Dynamically find any logo file (logo.png, logo.jpg, logo.svg, etc) in the client folder
const logos = import.meta.glob('/logo.*', { eager: true, query: '?url', import: 'default' });
const logoPaths = Object.values(logos);
if (logoPaths.length > 0) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = logoPaths[0];
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
