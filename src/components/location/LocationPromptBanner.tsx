
import React from 'react';
import { MapPin, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-quantum-darkBlue/50 border-quantum-cyan/20 overflow-hidden mb-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-start">
                <div className="mr-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="bg-quantum-cyan/20 h-12 w-12 rounded-full flex items-center justify-center"
                  >
                    <MapPin className="h-6 w-6 text-quantum-cyan" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2 text-quantum-cyan">Enable location services</h3>
                  <p className="text-gray-300 mb-4">
                    Find restaurants near you and get personalized recommendations based on your location.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleRequestLocation}
                      disabled={isRequesting || permissionStatus === 'denied'}
                      size="lg"
                      className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black"
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>Enable Location</>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-quantum-cyan/30"
                      size="lg"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Why we need this
                    </Button>
                  </div>
                  
                  {permissionStatus === 'denied' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 text-sm bg-red-900/20 border border-red-700/30 rounded-md p-3"
                    >
                      <p>Please enable location access in your browser settings.</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="hidden md:block w-1/3 bg-gradient-to-r from-quantum-darkBlue to-quantum-purple/30 p-6">
              <div className="h-full flex flex-col justify-center">
                <h4 className="text-lg text-quantum-cyan mb-3">Benefits of location sharing</h4>
                <ul className="space-y-2 text-sm">
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan mr-2"></span>
                    <span>Find closest restaurants to your location</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan mr-2"></span>
                    <span>Get accurate delivery time estimates</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-quantum-cyan mr-2"></span>
                    <span>Personalized recommendations nearby</span>
                  </motion.li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LocationPromptBanner;
