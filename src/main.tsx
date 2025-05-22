
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { CartProvider } from './contexts/CartContext'
import { ResponsiveProvider } from './contexts/ResponsiveContext'
import { Platform } from './utils/platform'

// Configure iOS status bar for native app
const configureIOSStatusBar = async () => {
  if (Platform.isIOS()) {
    try {
      // Dynamically import StatusBar
      const importModule = new Function('return import("@capacitor/status-bar")')();
      const module = await importModule;
      const StatusBar = module.StatusBar;
      
      // Configure status bar
      await StatusBar.setStyle({ style: 'dark' });
      if (Platform.hasNotch() || Platform.hasDynamicIsland()) {
        await StatusBar.setOverlaysWebView({ overlay: true });
      }
    } catch (error) {
      console.error('Error configuring iOS status bar:', error);
    }
  }
};

// Initialize platform configurations
const initializePlatform = async () => {
  await configureIOSStatusBar();
};

// Simple error boundary for startup errors
const renderApp = async () => {
  try {
    // Initialize platform configurations
    await initializePlatform();
    
    // Apply iOS-specific body classes if needed
    if (Platform.isIOS()) {
      document.body.classList.add('ios-device');
      
      if (Platform.hasNotch()) {
        document.body.classList.add('has-notch');
      }
      
      if (Platform.hasDynamicIsland()) {
        document.body.classList.add('has-dynamic-island');
      }
    }

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ResponsiveProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ResponsiveProvider>
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
