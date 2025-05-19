
import { Platform } from '../platform';
import { WebStorage } from './webStorage';
import { NativeStorage } from './nativeStorage';
import { OfflineStorage } from './types';

// Factory function to create the appropriate storage implementation
export const createOfflineStorage = (): OfflineStorage => {
  return Platform.isNative() ? new NativeStorage() : new WebStorage();
};

// Create a singleton instance
const offlineStorage = createOfflineStorage();

export default offlineStorage;
