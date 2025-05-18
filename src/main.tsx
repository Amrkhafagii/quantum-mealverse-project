
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { ThemeProvider } from './components/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MapViewProvider>
        <App />
        <Toaster />
      </MapViewProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
