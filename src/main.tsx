
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { CartProvider } from './contexts/CartContext'
import { ResponsiveProvider } from './contexts/ResponsiveContext'

// Simple error boundary for startup errors
const renderApp = () => {
  try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <CartProvider>
          <App />
        </CartProvider>
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Error rendering application:', error);
    // Render a minimal error view
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2>App Loading Error</h2>
        <p>There was a problem starting the application. Please try again later.</p>
      </div>
    `;
  }
};

// Start the app after a small delay to ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

// Fallback if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(renderApp, 1);
}
