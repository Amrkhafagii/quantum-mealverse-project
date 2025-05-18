
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Smartphone, Camera, QrCode, View3d } from 'lucide-react';
import HolographicCard from './HolographicCard';
import { useARPreview } from '@/hooks/useARPreview';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import MealViewer from './MealViewer';

interface ARMealPreviewProps {
  mealId: number | string;
  mealName: string;
  className?: string;
}

const ARMealPreview = ({ mealId, mealName, className }: ARMealPreviewProps) => {
  const [showQR, setShowQR] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const navigate = useNavigate();
  
  const { 
    isSupported, 
    isLoading, 
    startARSession, 
    error 
  } = useARPreview();
  
  const handleLaunchAR = async () => {
    // On a real device, this would trigger the AR experience
    if (isSupported) {
      const success = await startARSession({ planeDetection: true });
      if (success) {
        // In a real implementation, we would now be in the AR view
        toast({
          title: "AR Session Started",
          description: "Viewing " + mealName + " in augmented reality",
        });
      } else if (error) {
        toast({
          title: "AR Error",
          description: error,
          variant: "destructive",
        });
      }
    } else {
      // For demo purposes, navigate to a placeholder AR page
      navigate(`/ar-view/${mealId}`);
    }
  };
  
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
          
          {show3DPreview ? (
            <div className="w-full">
              <MealViewer 
                className="w-full h-80 mb-4" 
                selectedMealId={typeof mealId === 'string' ? parseInt(mealId) : mealId} 
              />
              <Button 
                variant="outline"
                onClick={() => setShow3DPreview(false)}
                className="w-full"
              >
                Back to options
              </Button>
            </div>
          ) : showQR ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-md mb-4">
                <QrCode className="h-32 w-32 text-quantum-black" />
              </div>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Scan this QR code with your phone to view this meal in AR
              </p>
              <Button 
                variant="outline"
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                Back to options
              </Button>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <Button 
                onClick={() => setShowQR(true)}
                className="bg-quantum-purple hover:bg-quantum-darkPurple text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center w-full"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Show QR Code
              </Button>
              
              <Button 
                onClick={handleLaunchAR}
                className="cyber-button flex items-center justify-center w-full"
                disabled={isLoading}
              >
                <Smartphone className="h-5 w-5 mr-2" />
                {isLoading ? 'Loading...' : 'Launch on Device'}
              </Button>
              
              <Button 
                onClick={() => setShow3DPreview(true)}
                variant="outline" 
                className="flex items-center justify-center w-full"
              >
                <View3d className="h-5 w-5 mr-2" />
                View 3D Preview
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Note: AR features require a compatible device with ARKit (iOS) or ARCore (Android).
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
