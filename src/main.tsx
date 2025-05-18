
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ResponsiveProvider } from './contexts/ResponsiveContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CartProvider>
          <ResponsiveProvider>
            <MapViewProvider>
              <App />
              <Toaster />
            </MapViewProvider>
          </ResponsiveProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
