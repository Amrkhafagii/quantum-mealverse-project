
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleMapsImplementationDemo from '@/components/maps/GoogleMapsImplementationDemo';
import BatteryEfficientTracker from '@/components/delivery/BatteryEfficientTracker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMapService } from '@/contexts/MapServiceContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { GoogleMapsKeyForm } from '@/components/maps/GoogleMapsKeyForm';

const MigrationDashboard = () => {
  const { performanceLevel, setPerformanceLevel } = useMapService();
  const { googleMapsApiKey, keySource } = useGoogleMaps();
  const [showKeyForm, setShowKeyForm] = useState(false);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Google Maps Migration Dashboard</h1>
      
      {!googleMapsApiKey && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Maps API Key Missing</AlertTitle>
          <AlertDescription>
            To use all features of this dashboard, 
            <Button 
              variant="link" 
              onClick={() => setShowKeyForm(true)} 
              className="px-2 py-0 h-auto"
            >
              add your Google Maps API key
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {showKeyForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Google Maps API Key Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMapsKeyForm onKeySubmit={() => setShowKeyForm(false)} />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current performance mode: <strong>{performanceLevel}</strong>
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  variant={performanceLevel === 'high' ? 'default' : 'outline'} 
                  onClick={() => setPerformanceLevel('high')}
                  className="w-full"
                >
                  High Performance
                </Button>
                <Button 
                  variant={performanceLevel === 'medium' ? 'default' : 'outline'}
                  onClick={() => setPerformanceLevel('medium')}
                  className="w-full"
                >
                  Medium Performance
                </Button>
                <Button 
                  variant={performanceLevel === 'low' ? 'default' : 'outline'}
                  onClick={() => setPerformanceLevel('low')}
                  className="w-full"
                >
                  Low Performance
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Change performance settings to test different map behaviors.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Battery Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <BatteryEfficientTracker />
          </CardContent>
        </Card>
      </div>
      
      <GoogleMapsImplementationDemo />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="architecture">
            <TabsList className="mb-4">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resilience">Resilience</TabsTrigger>
              <TabsTrigger value="code">Code Samples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="architecture">
              <div className="space-y-4">
                <h3 className="font-medium">Google Maps Integration Architecture</h3>
                <p className="text-sm">
                  Our standardized Google Maps stack uses a layered architecture:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Service Layer</strong>: Abstracts Google Maps API calls with platform-specific implementations</li>
                  <li><strong>Context Layer</strong>: Provides React contexts for accessing maps and location services</li>
                  <li><strong>Hook Layer</strong>: Custom hooks for specific use cases like geofencing and tracking</li>
                  <li><strong>Component Layer</strong>: Reusable UI components that leverage the hooks and services</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="space-y-4">
                <h3 className="font-medium">Performance Optimizations</h3>
                <p className="text-sm">
                  Key performance features implemented:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Battery Efficiency</strong>: Dynamic tracking intervals based on battery status</li>
                  <li><strong>Data Usage</strong>: Reduced API calls and optimized payload sizes</li>
                  <li><strong>Memory Management</strong>: Proper cleanup of event listeners and map instances</li>
                  <li><strong>Adaptive Precision</strong>: Adjusts location precision based on use case</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="resilience">
              <div className="space-y-4">
                <h3 className="font-medium">Resilience Features</h3>
                <p className="text-sm">
                  Key resilience features implemented:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>API Key Management</strong>: Centralized API key handling with multiple fallback sources</li>
                  <li><strong>Error Handling</strong>: Structured error parsing with user-friendly messages</li>
                  <li><strong>Retry Logic</strong>: Exponential backoff retry for transient failures</li>
                  <li><strong>Network Awareness</strong>: Adapts to network conditions and recovers after offline periods</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="code">
              <div className="space-y-4">
                <h3 className="font-medium">Key Code Examples</h3>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto">
                  <pre className="text-xs">
{`// Example of resilient API key management
const apiKeyInfo = await googleMapsKeyManager.loadApiKey();
setIsLoaded(!!apiKeyInfo.key);

// Example of error handling with retry logic
const result = await withGoogleMapsErrorHandling(
  async () => {
    return retryWithBackoff(
      () => mapService.geocodeAddress(address),
      { maxRetries: 3, initialDelayMs: 1000 }
    );
  },
  { 
    showToast: true,
    context: 'Geocoding Address' 
  }
);

// Battery-efficient location tracking
useEffect(() => {
  const { trackingMode } = calculateTrackingMode({
    isLowBattery,
    isLowQuality,
    orderStatus,
    location: currentLocation,
    forceLowPowerMode: energyEfficient && Platform.isLowEndDevice()
  });
  
  setTrackingInterval(getTrackingInterval(trackingMode));
}, [currentLocation, isLowBattery, isLowQuality]);`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationDashboard;
