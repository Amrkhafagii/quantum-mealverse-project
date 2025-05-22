
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { MapViewProvider } from './contexts/MapViewContext'
import { CartProvider } from './contexts/CartContext'
import { ResponsiveProvider } from './contexts/ResponsiveContext'
import { Platform } from './utils/platform'

// CSS variables for safe area insets
if (typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
  document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
  document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
  document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
}

// Configure iOS status bar for native app
const configureIOSStatusBar = async () => {
  if (!Platform.isIOS()) {
    return;
  }
  
  try {
    // Use standard dynamic import instead of Function constructor
    const { StatusBar } = await import('@capacitor/status-bar');
    
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
};

// Initialize platform configurations
const initializePlatform = async () => {
  try {
    await configureIOSStatusBar();
  } catch (error) {
    console.error('Error initializing platform:', error);
  }
};

// Track device orientation
const setupOrientationClasses = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  const updateOrientation = () => {
    try {
      const isLandscape = window.innerWidth > window.innerHeight;
      
      if (isLandscape) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
      } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
      }
      
      // Reset Platform cache when orientation changes
      Platform.resetCache();
    } catch (error) {
      console.error('Error updating orientation classes:', error);
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

    // Create React root and render app
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ResponsiveProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ResponsiveProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Error rendering application:', error);
    // Render a minimal error view
    if (document && document.body) {
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h2>App Loading Error</h2>
          <p>There was a problem starting the application. Please try again later.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      `;
    }
  }
};

// Start the app after a small delay to ensure DOM is fully loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(renderApp, 10);
    });
  } else {
    // DOM already loaded, render app with a small delay
    setTimeout(renderApp, 10);
  }
}
