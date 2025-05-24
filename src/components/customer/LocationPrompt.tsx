
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, Globe, Navigation } from 'lucide-react';
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
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-600/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-200 mb-4">Location Access Required</h2>
              <p className="text-red-300 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                {error}
              </p>
              <div className="bg-red-950/30 border border-red-600/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-200 mb-2">Why do we need your location?</h3>
                <ul className="text-sm text-red-300 space-y-2 text-left max-w-lg mx-auto">
                  <li className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 flex-shrink-0" />
                    Find restaurants near you
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    Calculate accurate delivery times
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    Show relevant menu options
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onRequestLocation}
                  disabled={isLoading}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {isLoading ? 'Requesting Access...' : 'Try Again'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-red-500/50 text-red-200 hover:bg-red-500/10 px-8 py-3"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
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
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-quantum-darkBlue/40 to-quantum-cyan/20 border-quantum-cyan/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-quantum-cyan mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Quantum Mealverse</h2>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                To provide you with the best dining experience, we need to know your location to find nearby restaurants and calculate delivery times.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-4">
                  <Navigation className="h-8 w-8 text-quantum-cyan mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Find Nearby</h3>
                  <p className="text-sm text-gray-400">Discover restaurants in your area</p>
                </div>
                <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-4">
                  <MapPin className="h-8 w-8 text-quantum-cyan mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Fast Delivery</h3>
                  <p className="text-sm text-gray-400">Get accurate delivery estimates</p>
                </div>
                <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-4">
                  <Globe className="h-8 w-8 text-quantum-cyan mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Personalized</h3>
                  <p className="text-sm text-gray-400">Customized recommendations</p>
                </div>
              </div>

              <Button 
                onClick={onRequestLocation}
                disabled={isLoading}
                size="lg"
                className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-semibold px-12 py-4 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-quantum-black mr-3"></div>
                    Getting Your Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-3" />
                    Enable Location Access
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
                Your location data is secure and only used to enhance your dining experience. We never share your location with third parties.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};
