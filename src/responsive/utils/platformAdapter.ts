
import { Platform } from './platform';

interface MapOptions {
  isMobile: boolean;
  isNative: boolean;
  isLowPowerMode: boolean;
  isTablet: boolean;
  deviceType: 'phone' | 'tablet' | 'desktop';
}

/**
 * PlatformAdapter provides a unified way to adapt components to different platforms
 * without duplicating adaptation logic across components.
 */
export class PlatformAdapter {
  /**
   * Get map options optimized for the current platform
   */
  static getMapOptions(options?: Partial<MapOptions>): Record<string, any> {
    const isMobile = options?.isMobile ?? Platform.isMobileDevice();
    const isNative = options?.isNative ?? Platform.isNative();
    const isLowPowerMode = options?.isLowPowerMode ?? false;
    const isTablet = options?.isTablet ?? Platform.isTablet();
    
    // Base options
    const mapOptions: Record<string, any> = {
      zoomControl: !isMobile || isTablet,
      mapTypeControl: !isMobile && !isLowPowerMode,
      streetViewControl: !isMobile && !isLowPowerMode,
      fullscreenControl: !isMobile && !isLowPowerMode,
      gestureHandling: isMobile ? 'greedy' : 'auto',
      styles: []
    };
    
    // Apply platform-specific optimizations
    if (isNative) {
      // Native platform optimizations
      mapOptions.zoomControl = false; // Native has built-in pinch to zoom
      mapOptions.rotateControl = false;
      mapOptions.styles = [
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      ];
      
      if (isLowPowerMode) {
        mapOptions.lite = true;
      }
    } else if (isMobile) {
      // Mobile web optimizations
      mapOptions.draggable = true;
      mapOptions.styles = [
        { featureType: 'poi', stylers: [{ visibility: isLowPowerMode ? 'off' : 'on' }] },
        { featureType: 'transit', stylers: [{ visibility: isLowPowerMode ? 'off' : 'on' }] }
      ];
    }
    
    // Apply low power mode optimizations
    if (isLowPowerMode) {
      mapOptions.disableDefaultUI = true;
      mapOptions.draggingEnabled = false;
      mapOptions.mapTypeControl = false;
      mapOptions.styles = [
        ...mapOptions.styles,
        { stylers: [{ saturation: -70 }, { lightness: 20 }] }
      ];
    }
    
    return mapOptions;
  }
  
  /**
   * Get interaction settings based on platform
   */
  static getInteractionSettings(): Record<string, any> {
    const isMobile = Platform.isMobileDevice();
    const isNative = Platform.isNative();
    
    return {
      touchAction: isMobile ? 'manipulation' : 'auto',
      tapDelay: isMobile ? (isNative ? 0 : 200) : 0,
      useNativeTouchEvents: isNative,
      preventDefaultTouchEvents: !isNative && isMobile,
      passiveEventListeners: true,
    };
  }
}

export default PlatformAdapter;
