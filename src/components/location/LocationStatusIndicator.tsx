
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
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({ 
  showTooltip = false 
}) => {
  const { permissionStatus, isTracking } = useLocationPermission();
  
  const renderIcon = () => {
    if (permissionStatus === 'granted' && isTracking) {
      return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    } else if (permissionStatus === 'denied') {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    } else {
      return <MapPin className="h-4 w-4 text-yellow-400" />;
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
