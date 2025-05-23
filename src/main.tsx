
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Platform } from './utils/platform';
import { locationService } from './services/location/LocationService';
import { locationPermissionService } from './services/permission/LocationPermissionService';
import { Preferences } from '@capacitor/preferences';
import { useAppInitialization } from './hooks/useAppInitialization';

// App wrapper with unified initialization logic
const AppWithInitialization = () => {
  // Use our custom hook for app initialization which handles permissions and services
  const { isInitializing, isInitialized, error } = useAppInitialization();
  
  // Show loading state if still initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing app...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-4 max-w-md">
          <p className="font-bold">Error</p>
          <p>{error.message || 'Failed to initialize app'}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Render the app once initialized
  return <App />;
};

// Initialize platform utilities before rendering
const initializeApp = async () => {
  try {
    // Initialize platform detection
    await Platform.initialize();
    
    // Log platform info for debugging
    console.log('Platform initialized:', {
      isWeb: Platform.isWeb(),
      isAndroid: Platform.isAndroid(),
      isIOS: Platform.isIOS(),
      isMobile: Platform.isMobile(),
      isTablet: Platform.isTablet(),
      isInitialized: Platform.isInitialized()
    });
    
    // Add iOS-specific meta tags and styling if needed
    if (Platform.isIOS()) {
      // Set up iOS-specific meta tags
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no'
        );
      }
      
      // Add status bar styling based on device
      if (Platform.hasDynamicIsland && Platform.hasDynamicIsland()) {
        document.documentElement.style.setProperty('--safe-area-top', '54px');
        console.log('Device has dynamic island, using 54px safe area top');
      } else if (Platform.hasNotch && Platform.hasNotch()) {
        document.documentElement.style.setProperty('--safe-area-top', '44px');
        console.log('Device has notch, using 44px safe area top');
      } else {
        document.documentElement.style.setProperty('--safe-area-top', '20px');
      }
      
      // Set CSS variables for safe area insets
      document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
      document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
      document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
      document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
    }
    
    // Set up orientation change handler for mobile devices
    if (Platform.isMobile()) {
      window.addEventListener('orientationchange', () => {
        // Reset platform cache on orientation change to force recalculation
        if (Platform.resetCache) {
          Platform.resetCache();
        }
        
        // Apply a small delay to ensure dimensions are updated
        setTimeout(() => {
          console.log('Orientation changed, dimensions:', {
            width: window.innerWidth,
            height: window.innerHeight
          });
        }, 100);
      });
    }
    
    // Render the app after initialization
    renderApp();
  } catch (error) {
    console.error('Error initializing app:', error);
    // Render anyway even if initialization failed
    renderApp();
  }
};

// Function to render the React app
const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  
  root.render(
    <React.StrictMode>
      <AppWithInitialization />
    </React.StrictMode>
  );
  
  // Log device details for debugging
  logDeviceDetails();
};

// Helper function to log device details
const logDeviceDetails = async () => {
  try {
    const deviceInfo = await Platform.getDeviceInfo();
    const iPhoneModel = Platform.getiPhoneModel ? Platform.getiPhoneModel() : 'unknown';
    
    console.log('Device details:', {
      deviceInfo,
      iPhoneModel,
      hasNotch: Platform.hasNotch ? Platform.hasNotch() : 'unknown',
      hasDynamicIsland: Platform.hasDynamicIsland ? Platform.hasDynamicIsland() : 'unknown',
      isPlatformIOS: Platform.isIOS(),
      isPlatformAndroid: Platform.isAndroid(),
      isMobile: Platform.isMobile(),
      isTablet: Platform.isTablet()
    });
  } catch (error) {
    console.error('Error logging device details:', error);
  }
};

// Start initialization process
initializeApp();
