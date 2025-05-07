
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapIcon, RefreshCw, Loader2, Map, MapPin, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface OfflineMapFallbackProps {
  title: string;
  description: string;
  retry?: () => void;
  isRetrying?: boolean;
  showLocationData?: boolean;
  locationData?: LocationData;
  className?: string;
}

export const OfflineMapFallback: React.FC<OfflineMapFallbackProps> = ({
  title,
  description,
  retry,
  isRetrying = false,
  showLocationData = false,
  locationData,
  className = ''
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="bg-slate-800 h-[300px] flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 relative">
            <motion.div
              initial={{ opacity: 0.7, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              <WifiOff className="h-16 w-16 text-slate-500" />
            </motion.div>
            <div className="absolute -right-2 -bottom-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">!</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-300 mb-6">{description}</p>
          
          {retry && (
            <Button 
              variant="outline" 
              onClick={retry} 
              disabled={isRetrying}
              className="border-slate-500 text-slate-200"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          )}
          
          {showLocationData && locationData && (
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg w-full max-w-sm">
              <div className="flex items-center mb-2">
                <Map className="h-4 w-4 mr-2 text-slate-400" />
                <h4 className="text-sm font-medium text-slate-300">Location Details</h4>
              </div>
              
              {locationData.address && (
                <div className="flex items-start mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 break-words">{locationData.address}</p>
                </div>
              )}
              
              {locationData.latitude && locationData.longitude && (
                <div className="text-xs text-slate-500 mt-2">
                  Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineMapFallback;
