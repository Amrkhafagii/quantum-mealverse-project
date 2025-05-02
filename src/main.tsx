
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext'
import { Toaster } from '@/components/ui/toaster'
import 'mapbox-gl/dist/mapbox-gl.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleMapsProvider>
        <App />
        <Toaster />
      </GoogleMapsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
