
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationPermission } from '@/hooks/useLocationPermission';

interface LocationPromptBannerProps {
  onPermissionGranted?: () => void;
}

const LocationPromptBanner: React.FC<LocationPromptBannerProps> = ({
  onPermissionGranted
}) => {
  const { requestPermission, permissionStatus, isRequesting } = useLocationPermission();

  const handleRequestLocation = async () => {
    const result = await requestPermission();
    if (result && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <div className="bg-quantum-darkBlue/50 border-l-4 border-quantum-cyan p-4 mb-6 rounded flex items-center justify-between">
      <div className="flex items-center">
        <MapPin className="h-5 w-5 text-quantum-cyan mr-3" />
        <div>
          <p className="font-medium">Enable location services</p>
          <p className="text-sm text-gray-400">Find restaurants near you and get personalized recommendations</p>
        </div>
      </div>
      <Button 
        onClick={handleRequestLocation}
        disabled={isRequesting || permissionStatus === 'denied'}
        className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
      >
        {isRequesting ? 'Requesting...' : 'Enable Location'}
      </Button>
    </div>
  );
};

export default LocationPromptBanner;
