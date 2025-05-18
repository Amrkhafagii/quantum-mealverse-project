
import React, { useState } from 'react';
import { useQrScanner } from '@/hooks/useQrScanner';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, QrCode } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Platform } from '@/utils/platform';
import { useToast } from '@/components/ui/use-toast';

interface QrCodeScannerProps {
  onScan?: (data: string) => void;
  buttonLabel?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export const QrCodeScanner = ({
  onScan,
  buttonLabel = "Scan QR Code",
  buttonVariant = "default",
  buttonSize = "default"
}: QrCodeScannerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { scan, isScanning, requestPermission } = useQrScanner({
    onScan: (data) => {
      if (onScan) {
        onScan(data);
      }
      setDialogOpen(false);
      toast({
        title: "QR Code Scanned",
        description: `Content: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`,
      });
    },
    onError: (error) => {
      setDialogOpen(false);
    }
  });
  
  const handleScanClick = async () => {
    if (!Platform.isNative()) {
      toast({
        title: "QR Scanning unavailable",
        description: "QR scanning is only available on native mobile devices.",
        variant: "destructive"
      });
      return;
    }
    
    const permissionGranted = await requestPermission();
    if (permissionGranted) {
      setDialogOpen(true);
      scan();
    }
  };

  return (
    <>
      <Button 
        onClick={handleScanClick}
        variant={buttonVariant}
        size={buttonSize}
        disabled={isScanning || !Platform.isNative()}
      >
        {isScanning ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <QrCode className="h-4 w-4 mr-2" />
        )}
        {buttonLabel}
      </Button>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scanning QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              {isScanning ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p>Positioning your camera at a QR code...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Camera className="h-12 w-12 mb-4 text-primary" />
                  <p>Point your camera at a QR code to scan</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isScanning}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QrCodeScanner;
