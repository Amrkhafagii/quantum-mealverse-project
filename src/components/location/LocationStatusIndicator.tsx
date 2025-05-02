
import React from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Badge } from '@/components/ui/badge';
import { MapPin, MapPinOff } from 'lucide-react';

export interface LocationStatusIndicatorProps {
  showTooltip?: boolean;
  colorVariant?: 'default' | 'navbar';
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({ 
  showTooltip = true,
  colorVariant = 'default' 
}) => {
  const { permissionStatus, trackingEnabled } = useLocationPermission();
  
  const isEnabled = permissionStatus === 'granted' && trackingEnabled;
  
  // Determine classes based on colorVariant
  const getStatusColor = () => {
    if (colorVariant === 'navbar') {
      return isEnabled ? 'text-green-400' : 'text-red-400';
    }
    return isEnabled ? 'text-quantum-cyan' : 'text-quantum-red';
  };
  
  return (
    <div className="flex items-center">
      {isEnabled ? (
        <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor()}`}>
          <MapPin className="h-3.5 w-3.5" />
          {showTooltip && <span className="text-xs">Tracking</span>}
        </Badge>
      ) : (
        <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor()}`}>
          <MapPinOff className="h-3.5 w-3.5" />
          {showTooltip && <span className="text-xs">Disabled</span>}
        </Badge>
      )}
    </div>
  );
};

export default LocationStatusIndicator;
