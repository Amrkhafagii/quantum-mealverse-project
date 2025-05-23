
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, HelpCircle } from 'lucide-react';
import { useLocationWithIndicators } from '@/hooks/useLocationWithIndicators';

interface LocationPermissionHandlerProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  compact?: boolean;
  darkMode?: boolean;
}

const LocationPermissionHandler: React.FC<LocationPermissionHandlerProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  compact = false,
  darkMode = true
}) => {
  const { requestLocationPermission } = useLocationWithIndicators();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      const result = await requestLocationPermission();
      if (result && onPermissionGranted) {
        onPermissionGranted();
      } else if (!result && onPermissionDenied) {
        onPermissionDenied();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className={`${darkMode ? 'bg-quantum-black/80 text-white' : 'bg-white'} border-quantum-cyan/20`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-quantum-cyan" />
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Enable Location Services
          </h3>
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          We need your location to show you nearby restaurants and improve your experience.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRequest}
            disabled={isRequesting}
            className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
            size={compact ? "sm" : "default"}
          >
            {isRequesting ? 'Requesting...' : 'Share Location'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionHandler;
