
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext'
import { Toaster } from '@/components/ui/toaster'
import 'mapbox-gl/dist/mapbox-gl.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleMapsProvider>
      <App />
      <Toaster />
    </GoogleMapsProvider>
  </React.StrictMode>,
)
