
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { useAuth } from '@/hooks/useAuth';
import { getLocationStatusColor, getLocationStatusMessage, getLocationUpdateRecommendation } from '@/utils/locationUIUtils';
import { useNavigate } from 'react-router-dom';

interface LocationStatusIndicatorProps {
  colorVariant?: 'default' | 'navbar';
}

const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({ 
  colorVariant = 'default'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDeliveryUser = user?.user_metadata?.user_type === 'delivery';
  
  // Only show location indicator for delivery users
  if (!isDeliveryUser) {
    return null;
  }

  const { permissionStatus, freshness, isTracking, updateLocation } = useDeliveryLocationService();
  
  // Determine if we need to show location settings button
  const showSettingsButton = permissionStatus === 'denied';
  
  // Get the appropriate styles based on the freshness status
  const statusColors = getLocationStatusColor(freshness);
  const statusMessage = getLocationStatusMessage(freshness);
  const updateRecommendation = getLocationUpdateRecommendation(freshness);
  
  // Show minimal version for navbar
  if (colorVariant === 'navbar') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative"
              onClick={() => navigate('/delivery/settings')}
            >
              <MapPin className={
                permissionStatus === 'granted' 
                  ? `text-green-500` 
                  : 'text-red-500'
              } />
              
              {permissionStatus === 'denied' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-quantum-black" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {permissionStatus === 'granted' 
              ? `Location: ${statusMessage}` 
              : 'Location access denied'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Show full version with status and button
  return (
    <div className={`border rounded-md px-3 py-1 flex gap-2 items-center ${statusColors}`}>
      <MapPin className="h-4 w-4" />
      
      {!showSettingsButton ? (
        <span className="text-sm whitespace-nowrap">{statusMessage}</span>
      ) : (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-sm">Location blocked</span>
        </div>
      )}
      
      {showSettingsButton ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs ml-1 hover:bg-black/20"
          onClick={() => navigate('/delivery/settings?locationDenied=true')}
        >
          Fix
        </Button>
      ) : (
        updateRecommendation && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs ml-1 hover:bg-black/20"
            onClick={() => updateLocation()}
          >
            Update
          </Button>
        )
      )}
    </div>
  );
};

export default LocationStatusIndicator;
