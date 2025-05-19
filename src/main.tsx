
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { ThemeProvider } from './components/theme-provider'
import { CartProvider } from './contexts/CartContext'
import { ResponsiveProvider } from './contexts/ResponsiveContext'
// Remove the AuthProvider from here since it's already in App.tsx

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartProvider>
        <ResponsiveProvider>
          <MapViewProvider>
            <App />
            <Toaster />
          </MapViewProvider>
        </ResponsiveProvider>
      </CartProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
