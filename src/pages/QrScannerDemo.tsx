
import React, { useState } from 'react';
import { QrCodeScanner } from '@/components/QrCodeScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Platform } from '@/utils/platform';

const QrScannerDemo = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  const handleScan = (data: string) => {
    setScannedData(data);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">QR Code Scanner</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scan a QR Code</CardTitle>
          <CardDescription>
            Use your device's camera to scan a QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <QrCodeScanner onScan={handleScan} />
          </div>
          
          {!Platform.isNative() && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md text-amber-700 dark:text-amber-300 text-sm mt-4">
              Note: QR scanning is only available on native mobile devices.
            </div>
          )}
        </CardContent>
      </Card>
      
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
              <pre className="whitespace-pre-wrap break-words">{scannedData}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QrScannerDemo;
