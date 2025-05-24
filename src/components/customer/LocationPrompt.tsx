
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationPromptProps {
  onRequestLocation: () => void;
  isLoading: boolean;
  error?: string | null;
  hasRequestedPermission: boolean;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({
  onRequestLocation,
  isLoading,
  error,
  hasRequestedPermission
}) => {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-red-900/20 border-red-600/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-200 mb-2">Location Access Issue</h3>
                <p className="text-red-300 mb-4">{error}</p>
                <p className="text-sm text-red-400 mb-4">
                  Don't worry! You can still browse all available restaurants and menu items without location access.
                </p>
                <Button 
                  variant="outline" 
                  onClick={onRequestLocation}
                  disabled={isLoading}
                  className="border-red-500/50 text-red-200 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!hasRequestedPermission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-quantum-cyan mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2">Find Restaurants Near You</h3>
                <p className="text-gray-300 mb-4">
                  Share your location to discover nearby restaurants and get personalized recommendations.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={onRequestLocation}
                    disabled={isLoading}
                    className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
                  >
                    {isLoading ? 'Getting Location...' : 'Share Location'}
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    Browse All Restaurants
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};
