
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Smartphone, Camera, QrCode } from 'lucide-react';
import HolographicCard from './HolographicCard';

interface ARMealPreviewProps {
  mealId: number;
  mealName: string;
  className?: string;
}

const ARMealPreview = ({ mealId, mealName, className }: ARMealPreviewProps) => {
  const [showQR, setShowQR] = useState(false);
  
  return (
    <div className={cn("relative", className)}>
      <HolographicCard className="p-6">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Camera className="h-16 w-16 text-quantum-purple" />
          </div>
          
          <h3 className="text-xl font-bold mb-2 text-quantum-cyan">Augmented Reality Preview</h3>
          
          <p className="text-gray-400 text-center mb-6">
            Experience your {mealName} in augmented reality. See exactly how it will look on your table before ordering.
          </p>
          
          {showQR ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-md mb-4">
                <QrCode className="h-32 w-32 text-quantum-black" />
              </div>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Scan this QR code with your phone to view this meal in AR
              </p>
              <button 
                onClick={() => setShowQR(false)}
                className="cyber-button"
              >
                Back
              </button>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <button 
                onClick={() => setShowQR(true)}
                className="bg-quantum-purple hover:bg-quantum-darkPurple text-white py-3 px-6 rounded-md transition-colors duration-300 flex items-center justify-center w-full"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Show QR Code
              </button>
              
              <button className="cyber-button flex items-center justify-center w-full">
                <Smartphone className="h-5 w-5 mr-2" />
                Launch on Device
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Note: This feature is a demonstration of AR capabilities. 
              Actual implementation would use AR.js or a similar WebXR framework.
            </p>
          </div>
        </div>
      </HolographicCard>
      
      {/* AR Badge */}
      <div className="absolute -top-3 -right-3 bg-quantum-purple text-white text-xs py-1 px-3 rounded-full">
        AR PREVIEW
      </div>
    </div>
  );
};

export default ARMealPreview;
