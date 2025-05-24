
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import providers
import { LocationServiceProvider } from './contexts/LocationServiceContext'
import { MapServiceProvider } from './contexts/MapServiceContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocationServiceProvider enableTracking={true}>
      <MapServiceProvider>
        <App />
      </MapServiceProvider>
    </LocationServiceProvider>
  </React.StrictMode>,
)
