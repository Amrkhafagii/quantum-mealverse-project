
export const Platform = {
  isNative: () => !!(window as any).Capacitor,
  isMobileDevice: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  getOS: (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Mac') !== -1) return 'macOS';
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    return 'Unknown';
  },

  // Platform-specific detection methods
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  isWeb: () => {
    return !Platform.isNative();
  },

  isMobileBrowser: () => {
    return Platform.isMobileDevice() && Platform.isWeb();
  },

  isTablet: () => {
    const userAgent = navigator.userAgent;
    return /iPad/.test(userAgent) || 
           (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },

  // iOS-specific methods
  hasNotch: () => {
    if (!Platform.isIOS()) return false;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    // iPhone X and newer models with notch
    return (
      (screenHeight === 812 && screenWidth === 375) || // iPhone X, XS, 11 Pro
      (screenHeight === 896 && screenWidth === 414) || // iPhone XR, XS Max, 11, 11 Pro Max
      (screenHeight === 844 && screenWidth === 390) || // iPhone 12, 12 Pro, 13, 13 Pro
      (screenHeight === 926 && screenWidth === 428)    // iPhone 12 Pro Max, 13 Pro Max
    );
  },

  hasDynamicIsland: () => {
    if (!Platform.isIOS()) return false;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    // iPhone 14 Pro models with Dynamic Island
    return (
      (screenHeight === 852 && screenWidth === 393) || // iPhone 14 Pro
      (screenHeight === 932 && screenWidth === 430)    // iPhone 14 Pro Max
    );
  },

  getiPhoneModel: () => {
    if (!Platform.isIOS()) return 'unknown';
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    
    if (screenHeight === 568 && screenWidth === 320) return 'iPhone5_SE1';
    if (screenHeight === 667 && screenWidth === 375) return 'iPhone6_7_8';
    if (screenHeight === 736 && screenWidth === 414) return 'iPhone6_7_8Plus';
    if (screenHeight === 812 && screenWidth === 375) return 'iPhoneX_XS_11Pro_12mini_13mini';
    if (screenHeight === 896 && screenWidth === 414) return 'iPhoneXR_XSMax_11';
    if (screenHeight === 844 && screenWidth === 390) return 'iPhone12_12Pro_13_13Pro_14';
    if (screenHeight === 926 && screenWidth === 428) return 'iPhone12ProMax_13ProMax_14Plus';
    if (screenHeight === 852 && screenWidth === 393) return 'iPhone14Pro';
    if (screenHeight === 932 && screenWidth === 430) return 'iPhone14ProMax';
    if (/iPad/.test(navigator.userAgent)) return 'iPad';
    
    return 'unknown';
  },

  // Android-specific methods
  getAndroidVersion: () => {
    if (!Platform.isAndroid()) return null;
    const match = navigator.userAgent.match(/Android (\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  },

  // Device capability detection
  isLowEndDevice: () => {
    // Simple heuristic based on available information
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 1;
    
    return hardwareConcurrency <= 2 || deviceMemory <= 2;
  },

  // Initialization and utility methods
  isInitialized: () => {
    try {
      // Check if platform detection is working
      return typeof navigator !== 'undefined' && 
             typeof window !== 'undefined' &&
             typeof navigator.userAgent === 'string';
    } catch (error) {
      return false;
    }
  },

  getPlatformName: () => {
    if (Platform.isIOS()) return 'iOS';
    if (Platform.isAndroid()) return 'Android';
    if (Platform.isWeb()) return 'Web';
    return 'Unknown';
  },

  resetCache: () => {
    // Placeholder for cache reset functionality
    // In a real implementation, this would clear any cached platform detection results
    console.log('Platform cache reset (placeholder)');
  }
};
