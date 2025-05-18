
import { useState } from 'react';
import QrScanner from '@/plugins/QrScannerPlugin';
import { Platform } from '@/utils/platform';
import { toast } from '@/components/ui/use-toast';

interface UseQrScannerOptions {
  onScan?: (data: string) => void;
  onError?: (error: Error) => void;
}

export const useQrScanner = (options?: UseQrScannerOptions) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!Platform.isNative()) {
        toast({
          title: "QR Scanning unavailable",
          description: "QR scanning is only available on native mobile devices.",
          variant: "destructive"
        });
        return false;
      }
      
      const { granted } = await QrScanner.requestCameraPermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
      return false;
    }
  };
  
  const scan = async (): Promise<string | null> => {
    try {
      if (!Platform.isNative()) {
        toast({
          title: "QR Scanning unavailable",
          description: "QR scanning is only available on native mobile devices.",
          variant: "destructive"
        });
        return null;
      }
      
      // If we don't have permission yet, request it
      if (hasPermission === null || hasPermission === false) {
        const granted = await requestPermission();
        if (!granted) {
          toast({
            title: "Permission denied",
            description: "Camera permission is required to scan QR codes.",
            variant: "destructive"
          });
          return null;
        }
      }
      
      setIsScanning(true);
      
      const { value } = await QrScanner.scanQrCode();
      setLastScannedValue(value);
      setIsScanning(false);
      
      if (options?.onScan) {
        options.onScan(value);
      }
      
      return value;
    } catch (error) {
      setIsScanning(false);
      console.error('Error scanning QR code:', error);
      
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      }
      
      toast({
        title: "Scanning failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      return null;
    }
  };
  
  return {
    scan,
    requestPermission,
    isScanning,
    lastScannedValue,
    hasPermission
  };
};
