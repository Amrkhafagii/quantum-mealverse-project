
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertCircle, Globe, Navigation, RotateCcw, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImprovedLocationPromptProps {
  onRequestLocation: () => void;
  onManualLocation: (lat: number, lng: number) => void;
  isLoading: boolean;
  error?: string | null;
  hasRequestedPermission: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  onResetPermission: () => void;
}

export const ImprovedLocationPrompt: React.FC<ImprovedLocationPromptProps> = ({
  onRequestLocation,
  onManualLocation,
  isLoading,
  error,
  hasRequestedPermission,
  permissionStatus,
  onResetPermission
}) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)');
      return;
    }
    
    onManualLocation(lat, lng);
    setShowManualEntry(false);
  };

  if (error && permissionStatus === 'denied') {
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
              <h2 className="text-2xl font-bold text-red-200 mb-4">Location Access Blocked</h2>
              <p className="text-red-300 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                {error}
              </p>
              
              <div className="bg-red-950/30 border border-red-600/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-200 mb-3">How to Fix This:</h3>
                <div className="text-sm text-red-300 space-y-2 text-left max-w-lg mx-auto">
                  <p className="flex items-start gap-2">
                    <Settings className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Click the location icon in your browser's address bar and select "Allow"</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <RotateCcw className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Refresh the page after changing permissions</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Globe className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Or use manual location entry below</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <Button 
                  onClick={onResetPermission}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset & Try Again
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-red-500/50 text-red-200 hover:bg-red-500/10 px-8 py-3"
                  onClick={() => setShowManualEntry(true)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Enter Location Manually
                </Button>
              </div>
              
              {showManualEntry && (
                <div className="bg-red-950/20 border border-red-600/20 rounded-lg p-4 mt-4">
                  <h4 className="text-red-200 font-semibold mb-3">Manual Location Entry</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Latitude (e.g., 40.7128)"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      className="bg-red-900/20 border-red-500/30 text-white"
                    />
                    <Input
                      placeholder="Longitude (e.g., -74.0060)"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      className="bg-red-900/20 border-red-500/30 text-white"
                    />
                  </div>
                  <Button onClick={handleManualSubmit} className="w-full bg-red-600 hover:bg-red-700">
                    Set Location
                  </Button>
                </div>
              )}
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                
                <Button 
                  variant="outline"
                  onClick={() => setShowManualEntry(true)}
                  size="lg"
                  className="border-quantum-cyan/50 text-quantum-cyan hover:bg-quantum-cyan/10 px-8 py-4"
                >
                  Enter Manually
                </Button>
              </div>
              
              {showManualEntry && (
                <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-4 mt-6 max-w-md mx-auto">
                  <h4 className="text-quantum-cyan font-semibold mb-3">Manual Location Entry</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Latitude"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      className="bg-quantum-darkBlue/50 border-quantum-cyan/30 text-white"
                    />
                    <Input
                      placeholder="Longitude"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      className="bg-quantum-darkBlue/50 border-quantum-cyan/30 text-white"
                    />
                  </div>
                  <Button onClick={handleManualSubmit} className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/80">
                    Set Location
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
                Your location data is secure and only used to enhance your dining experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};
