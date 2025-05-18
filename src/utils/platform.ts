
/**
 * Platform detection utility for cross-platform code
 */
export class Platform {
  static get isWeb(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  static get isNative(): boolean {
    return !this.isWeb;
  }

  static get isIOS(): boolean {
    return this.isNative && this._getPlatformName() === 'ios';
  }

  static get isAndroid(): boolean {
    return this.isNative && this._getPlatformName() === 'android';
  }

  private static _getPlatformName(): string {
    try {
      // For React Native environments
      if (!this.isWeb) {
        const { Platform } = require('react-native');
        return Platform.OS.toLowerCase();
      }
    } catch (e) {
      // Ignore errors when React Native is not available
    }
    return 'web';
  }
}
