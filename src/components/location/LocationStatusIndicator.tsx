import React from 'react';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationStatusIndicatorProps {
  showTooltip?: boolean;
  colorVariant?: 'default' | 'navbar';
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({ 
  showTooltip = false,
  colorVariant = 'default'
}) => {
  const { permissionStatus, isTracking } = useLocationPermission();
  
  // Don't render anything if permission status is prompt
  if (permissionStatus === 'prompt') {
    return null;
  }
  
  const getIconColor = () => {
    if (colorVariant === 'navbar') {
      // Navbar-specific colors
      if (permissionStatus === 'granted' && isTracking) {
        return "text-green-400";
      } else if (permissionStatus === 'denied') {
        return "text-red-400";
      } else {
        return "text-yellow-400";
      }
    } else {
      // Default colors
      if (permissionStatus === 'granted' && isTracking) {
        return "text-green-400";
      } else if (permissionStatus === 'denied') {
        return "text-red-400";
      } else {
        return "text-yellow-400";
      }
    }
  };
  
  const renderIcon = () => {
    const colorClass = getIconColor();
    
    if (permissionStatus === 'granted' && isTracking) {
      return <CheckCircle2 className={`h-4 w-4 ${colorClass}`} />;
    } else if (permissionStatus === 'denied') {
      return <AlertCircle className={`h-4 w-4 ${colorClass}`} />;
    } else {
      return <MapPin className={`h-4 w-4 ${colorClass}`} />;
    }
  };
  
  const getStatusText = () => {
    if (permissionStatus === 'granted' && isTracking) {
      return "Location tracking enabled";
    } else if (permissionStatus === 'denied') {
      return "Location access denied";
    } else {
      return "Location permission pending";
    }
  };
  
  const content = (
    <div className="flex items-center gap-2 py-1 px-2 bg-quantum-darkBlue/70 rounded-md border border-quantum-cyan/30">
      {renderIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </div>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {renderIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return content;
};

export default LocationStatusIndicator;
