
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
      
      // Check device type for proper configuration
      if (Platform.hasDynamicIsland()) {
        // For devices with Dynamic Island
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setBackgroundColor({ color: '#FFFFFF00' }); // Transparent
      } else if (Platform.hasNotch()) {
        // For devices with notch
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } else {
        // For regular devices
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
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

// Track device orientation
const setupOrientationClasses = () => {
  const updateOrientation = () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      document.body.classList.add('landscape');
      document.body.classList.remove('portrait');
    } else {
      document.body.classList.add('portrait');
      document.body.classList.remove('landscape');
    }
  };
  
  // Set initial orientation
  updateOrientation();
  
  // Update on resize and orientation change
  window.addEventListener('resize', updateOrientation);
  window.addEventListener('orientationchange', updateOrientation);
};

// Simple error boundary for startup errors
const renderApp = async () => {
  try {
    // Initialize platform configurations
    await initializePlatform();
    
    // Apply iOS-specific body classes if needed
    if (Platform.isIOS()) {
      document.body.classList.add('ios-device');
      
      // Add specific device classes
      const model = Platform.getiPhoneModel();
      document.body.classList.add(`device-${model}`);
      
      if (Platform.hasNotch()) {
        document.body.classList.add('has-notch');
      }
      
      if (Platform.hasDynamicIsland()) {
        document.body.classList.add('has-dynamic-island');
      }
      
      // Set up orientation tracking
      setupOrientationClasses();
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
