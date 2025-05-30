
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useNetwork } from '@/contexts/NetworkContext';
import { ConnectionStateIndicator } from '@/components/network/ConnectionStateIndicator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Wifi, WifiOff, AlertTriangle, SignalLow, RefreshCw } from 'lucide-react';
import { NetworkStateIndicator } from '@/components/orders/status/NetworkStateIndicator';
import { PageTransition } from '@/components/layout/PageTransition';

// Simulated network conditions
const networkConditions = [
  { name: "Excellent", latency: 10, quality: "excellent" },
  { name: "Good", latency: 50, quality: "good" },
  { name: "Fair", latency: 150, quality: "fair" },
  { name: "Poor", latency: 350, quality: "poor" },
  { name: "Very Poor", latency: 800, quality: "very-poor" },
  { name: "Offline", latency: 9999, quality: "unknown" }
];

// Component to simulate connection changes
const NetworkSimulator = () => {
  const [selectedCondition, setSelectedCondition] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transitionTime, setTransitionTime] = useState(3);
  const [showFlakyOption, setShowFlakyOption] = useState(false);
  
  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulate network condition change
    toast({
      title: "Simulating network change",
      description: `Changing to ${networkConditions[selectedCondition].name} connection in ${transitionTime} seconds`,
    });
    
    // In a real implementation, we would call a function to change network conditions
    setTimeout(() => {
      setIsSimulating(false);
      toast({
        title: "Network simulation complete",
        description: `Network changed to ${networkConditions[selectedCondition].name}`,
      });
    }, transitionTime * 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Condition Simulator</CardTitle>
        <CardDescription>Simulate different network conditions to test connection management features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Network Condition</Label>
          <div className="grid grid-cols-3 gap-2">
            {networkConditions.map((condition, index) => (
              <Button 
                key={index}
                variant={selectedCondition === index ? "default" : "outline"}
                onClick={() => setSelectedCondition(index)}
                className="flex flex-col items-center justify-center h-16"
              >
                {condition.name === "Excellent" && <Wifi className="h-4 w-4 mb-1" />}
                {condition.name === "Poor" && <SignalLow className="h-4 w-4 mb-1" />}
                {condition.name === "Offline" && <WifiOff className="h-4 w-4 mb-1" />}
                {condition.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Transition Time (seconds)</Label>
            <span className="text-sm">{transitionTime}s</span>
          </div>
          <Slider 
            value={[transitionTime]} 
            onValueChange={(value) => setTransitionTime(value[0])} 
            min={1}
            max={10}
            step={1}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="flaky-connection" 
            checked={showFlakyOption}
            onCheckedChange={setShowFlakyOption}
          />
          <Label htmlFor="flaky-connection">Simulate flaky connection</Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSimulate} disabled={isSimulating}>
          {isSimulating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Simulating...
            </>
          ) : (
            'Simulate'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Connection details component
const ConnectionDetails = () => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, latency, bandwidth, isFlaky } = useNetworkQuality();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Details</CardTitle>
        <CardDescription>Current network connection information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center mb-4">
          <NetworkStateIndicator showQuality={true} alwaysShow={true} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Connection Type</Label>
            <div className="font-medium">{connectionType || 'Unknown'}</div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Quality</Label>
            <div className="font-medium capitalize">{quality}</div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Stability</Label>
            <div className="flex items-center">
              {isFlaky ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="font-medium">Unstable</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                  <span className="font-medium">Stable</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Latency</Label>
            <span className="text-sm font-medium">{latency ? `${latency}ms` : 'Unknown'}</span>
          </div>
          <Progress value={latency ? Math.min(100, (latency / 500) * 100) : 0} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0ms</span>
            <span>250ms</span>
            <span>500ms+</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Bandwidth</Label>
            <span className="text-sm font-medium">{bandwidth ? `${(bandwidth/1000).toFixed(1)} Mbps` : 'Unknown'}</span>
          </div>
          <Progress value={bandwidth ? Math.min(100, (bandwidth / 10000) * 100) : 0} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5 Mbps</span>
            <span>10+ Mbps</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Settings component
const ConnectionSettings = () => {
  const { 
    offlineMode, 
    setOfflineMode,
    enableNetworkAlerts,
    setEnableNetworkAlerts,
    enablePredictiveWarnings,
    setEnablePredictiveWarnings
  } = useNetwork();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Settings</CardTitle>
        <CardDescription>Configure network behavior and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Offline Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={offlineMode === 'auto' ? "default" : "outline"}
              onClick={() => setOfflineMode('auto')}
            >
              Automatic
            </Button>
            <Button 
              variant={offlineMode === 'on' ? "default" : "outline"}
              onClick={() => setOfflineMode('on')}
            >
              Always On
            </Button>
            <Button 
              variant={offlineMode === 'off' ? "default" : "outline"}
              onClick={() => setOfflineMode('off')}
            >
              Always Off
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {offlineMode === 'auto' ? 
              'Automatically switch to offline mode when connection is lost' : 
              offlineMode === 'on' ? 
              'Always use offline mode regardless of connection status' :
              'Never use offline mode even when connection is lost'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="network-alerts">Network Status Alerts</Label>
              <p className="text-xs text-muted-foreground">Show notifications when connection status changes</p>
            </div>
            <Switch 
              id="network-alerts"
              checked={enableNetworkAlerts}
              onCheckedChange={setEnableNetworkAlerts}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="predictive-warnings">Predictive Warnings</Label>
              <p className="text-xs text-muted-foreground">Predict connection issues before they occur</p>
            </div>
            <Switch 
              id="predictive-warnings"
              checked={enablePredictiveWarnings}
              onCheckedChange={setEnablePredictiveWarnings}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Indicator showcase
const ConnectionIndicators = () => {
  const [exampleType, setExampleType] = useState<'normal' | 'offline' | 'poor'>('normal');
  
  useEffect(() => {
    // Reset to normal after a delay for demo purposes
    if (exampleType !== 'normal') {
      const timer = setTimeout(() => {
        setExampleType('normal');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [exampleType]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Indicators</CardTitle>
        <CardDescription>Visual indicators for different network states</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Connection State Demo</Label>
          <div className="flex space-x-2">
            <Button 
              variant={exampleType === 'normal' ? "default" : "outline"}
              onClick={() => setExampleType('normal')}
            >
              <Wifi className="h-4 w-4 mr-2" />
              Online
            </Button>
            <Button 
              variant={exampleType === 'poor' ? "default" : "outline"} 
              onClick={() => setExampleType('poor')}
            >
              <SignalLow className="h-4 w-4 mr-2" />
              Poor
            </Button>
            <Button 
              variant={exampleType === 'offline' ? "default" : "outline"}
              onClick={() => setExampleType('offline')}
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Offline
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 border p-4 rounded-md">
          <Label>Icon Variants</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator size="sm" />
              <span className="text-xs text-muted-foreground mt-1">Small</span>
            </div>
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator size="md" />
              <span className="text-xs text-muted-foreground mt-1">Medium</span>
            </div>
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator size="lg" />
              <span className="text-xs text-muted-foreground mt-1">Large</span>
            </div>
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator showText={true} />
              <span className="text-xs text-muted-foreground mt-1">With Text</span>
            </div>
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator variant="badge" />
              <span className="text-xs text-muted-foreground mt-1">Badge</span>
            </div>
            <div className="flex flex-col items-center">
              <ConnectionStateIndicator variant="full" showQuality={true} />
              <span className="text-xs text-muted-foreground mt-1">Full</span>
            </div>
          </div>
        </div>
        
        <div className="border p-4 rounded-md">
          <Label className="mb-4 block">Integration Examples</Label>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span>Header Integration</span>
              <ConnectionStateIndicator />
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span>Button with Status</span>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Refresh <ConnectionStateIndicator size="sm" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span>Status Badge</span>
              <Badge variant="outline" className="flex items-center gap-1.5">
                Status <ConnectionStateIndicator size="sm" />
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main demo page
const ConnectionManagementDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Connection Management</h1>
            <p className="text-muted-foreground">Demonstrate seamless offline/online transitions and connection quality monitoring</p>
          </div>
          <ConnectionStateIndicator variant="badge" showText showQuality className="mt-2 md:mt-0" />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="simulator">Network Simulator</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ConnectionDetails />
              <Card>
                <CardHeader>
                  <CardTitle>Connection Management Features</CardTitle>
                  <CardDescription>Built-in capabilities for handling network changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <Wifi className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Seamless Offline/Online Transitions</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically handles connection state changes and recovers data when coming back online
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Predictive Connection Warnings</h3>
                        <p className="text-sm text-muted-foreground">
                          Detects patterns indicating upcoming connection issues like tunnels or congestion
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <RefreshCw className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Smart Recovery Strategies</h3>
                        <p className="text-sm text-muted-foreground">
                          Prioritizes critical data recovery and implements exponential backoff for retries
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-primary/10 rounded-md mr-3">
                        <SignalLow className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Connection Quality Monitoring</h3>
                        <p className="text-sm text-muted-foreground">
                          Real-time monitoring of network quality with adjustments to application behavior
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="indicators">
            <ConnectionIndicators />
          </TabsContent>
          
          <TabsContent value="simulator">
            <NetworkSimulator />
          </TabsContent>
          
          <TabsContent value="settings">
            <ConnectionSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ConnectionManagementDemo;
