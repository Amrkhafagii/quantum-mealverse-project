
import { registerPlugin } from '@capacitor/core';

export interface QrScannerPlugin {
  /**
   * Request camera permission
   * @returns Promise with boolean indicating if permission was granted
   */
  requestCameraPermission(): Promise<{ granted: boolean }>;
  
  /**
   * Scan a QR code using the device camera
   * @returns Promise with the scanned QR code content
   */
  scanQrCode(): Promise<{ value: string }>;
  
  /**
   * Check if the device has a camera available for scanning
   * @returns Promise with boolean indicating if a camera is available
   */
  checkCameraAvailability(): Promise<{ available: boolean }>;
}

const QrScanner = registerPlugin<QrScannerPlugin>('QrScanner');

export default QrScanner;
