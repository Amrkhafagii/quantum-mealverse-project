
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Import providers
import { LocationServiceProvider } from './contexts/LocationServiceContext'
import { MapServiceProvider } from './contexts/MapServiceContext'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LocationServiceProvider enableTracking={true}>
        <MapServiceProvider>
          <App />
        </MapServiceProvider>
      </LocationServiceProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
