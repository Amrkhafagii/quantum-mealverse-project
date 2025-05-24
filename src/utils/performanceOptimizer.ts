
import { Platform } from '@/utils/platform';

type PerformanceLevel = 'high' | 'medium' | 'low';

/**
 * Utility class for optimizing performance across platforms
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceLevel: PerformanceLevel = 'high';
  private memoryWarningReceived: boolean = false;
  private batteryLow: boolean = false;
  
  /**
   * Get the singleton instance
   */
  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer();
    }
    return this.instance;
  }
  
  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    this.detectDeviceCapabilities();
    this.setupEventListeners();
  }
  
  /**
   * Get optimized map options based on current performance level
   */
  getOptimizedMapOptions(defaultOptions: any = {}): any {
    const options = { ...defaultOptions };
    
    switch (this.performanceLevel) {
      case 'low':
        // Severely limited functionality for low-end devices
        options.liteMode = true;
        options.disableDefaultUI = true;
        options.disableAnimation = true;
        options.maxZoom = 16;
        options.clickableIcons = false;
        options.enableHardwareAcceleration = false;
        break;
      
      case 'medium':
        // Some limitations for mid-range devices
        options.disableAnimation = false;
        options.clickableIcons = false;
        options.enableHardwareAcceleration = true;
        break;
      
      case 'high':
      default:
        // Full features for high-end devices
        options.disableAnimation = false;
        options.clickableIcons = true;
        options.enableHardwareAcceleration = true;
        break;
    }
    
    // Platform-specific optimizations
    if (Platform.isNative()) {
      if (Platform.isAndroid()) {
        // Android-specific optimizations
        options.androidLiteMode = this.performanceLevel === 'low';
      } else if (Platform.isIOS()) {
        // iOS-specific optimizations
        options.disablePointsOfInterest = this.performanceLevel !== 'high';
      }
    }
    
    return options;
  }
  
  /**
   * Get current performance level
   */
  getPerformanceLevel(): PerformanceLevel {
    return this.performanceLevel;
  }
  
  /**
   * Manually set performance level
   */
  setPerformanceLevel(level: PerformanceLevel): void {
    this.performanceLevel = level;
    console.info(`Performance level set to: ${level}`);
  }
  
  /**
   * Check if low performance mode should be enabled
   */
  shouldUseLowPerformanceMode(): boolean {
    return this.performanceLevel === 'low' || this.batteryLow;
  }
  
  /**
   * Detect device capabilities to determine initial performance level
   */
  private detectDeviceCapabilities(): void {
    try {
      // Check for memory constraints
      if (typeof window !== 'undefined' && 'deviceMemory' in navigator) {
        // @ts-ignore - deviceMemory is not in the standard TypeScript definitions
        const deviceMemory = navigator.deviceMemory as number | undefined;
        
        if (deviceMemory && deviceMemory <= 2) {
          this.performanceLevel = 'low';
        } else if (deviceMemory && deviceMemory <= 4) {
          this.performanceLevel = 'medium';
        } else {
          this.performanceLevel = 'high';
        }
      }
      
      // Check for battery status if available
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        // @ts-ignore - getBattery is not in the standard TypeScript definitions
        navigator.getBattery().then((battery: any) => {
          this.batteryLow = battery.level <= 0.15;
          
          battery.addEventListener('levelchange', () => {
            this.batteryLow = battery.level <= 0.15;
          });
        }).catch(() => {
          // Battery API not available, continue without it
        });
      }
    } catch (error) {
      console.warn('Error detecting device capabilities:', error);
    }
  }
  
  /**
   * Setup event listeners for performance-related events
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Listen for memory pressure events
    if ('onmemorypressure' in window) {
      // @ts-ignore - onmemorypressure is not in the standard TypeScript definitions
      window.addEventListener('memorypressure', () => {
        this.memoryWarningReceived = true;
        this.performanceLevel = 'low';
        console.warn('Memory pressure detected, reducing performance level');
      });
    }
    
    // For iOS memory warnings (requires Capacitor/Cordova plugin)
    if (Platform.isIOS() && document) {
      document.addEventListener('memorywarning', () => {
        this.memoryWarningReceived = true;
        this.performanceLevel = 'low';
        console.warn('iOS memory warning detected, reducing performance level');
      });
    }
    
    // Handle visibility change for background optimization
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // App went to background, can pause/reduce animations
        console.info('App in background, pausing non-essential operations');
      } else {
        // App came to foreground, resume normal operations
        console.info('App in foreground, resuming normal operations');
      }
    });
  }
}

export default PerformanceOptimizer.getInstance();
