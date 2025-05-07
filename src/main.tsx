
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MapViewProvider>
      <App />
      <Toaster />
    </MapViewProvider>
  </React.StrictMode>,
)
