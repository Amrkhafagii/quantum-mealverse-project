import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkAwareContainer } from '@/components/network/NetworkAwareContainer';
import RetryBoundary from '@/components/network/RetryBoundary';
import { useRequestQueue } from '@/components/network/RequestQueue';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';
import { NetworkStateIndicator } from '@/components/orders/status/NetworkStateIndicator';
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const NetworkAwareDemo = () => {
  const { isOnline } = useConnectionStatus();
  const { quality, isLowQuality, latency, bandwidth } = useNetworkQuality();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingQuality, setLoadingQuality] = useState<'high' | 'low' | 'offline'>('high');
  const { queueRequest } = useRequestQueue();
  
  // Example retry operation
  const dummyNetworkOperation = async () => {
    return new Promise((resolve, reject) => {
      const shouldFail = Math.random() > 0.5;
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Network operation failed'));
        } else {
          resolve({ success: true, data: 'Operation completed' });
        }
      }, 1000);
    });
  };
  
  const { execute, isRetrying, error, retries, maxRetries } = useNetworkRetry(
    dummyNetworkOperation, 
    { maxRetries: 3, retryOnNetworkChange: true }
  );
  
  // Simulate network-aware content loading
  useEffect(() => {
    if (activeTab === 'content') {
      setIsLoading(true);
      setLoadingProgress(0);
      
      // Determine loading quality based on connection
      if (!isOnline) {
        setLoadingQuality('offline');
      } else if (isLowQuality) {
        setLoadingQuality('low');
      } else {
        setLoadingQuality('high');
      }
      
      // Simulate progressive loading
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const increment = loadingQuality === 'high' ? 10 : 5;
          const newValue = prev + increment;
          if (newValue >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 500);
            return 100;
          }
          return newValue;
        });
      }, loadingQuality === 'high' ? 200 : 400);
      
      return () => clearInterval(interval);
    }
  }, [activeTab, isOnline, isLowQuality, loadingQuality]);
  
  // Queue a sample network request
  const handleQueueRequest = (priority: 'high' | 'normal' | 'low') => {
    const id = queueRequest({
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Request with ${priority} priority completed`);
        return { success: true };
      },
      priority,
      maxRetries: 3,
      description: `${priority} priority operation`
    });
    
    console.log(`Queued request with ID: ${id}`);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Network-Aware Features Demo</h1>
      
      <div className="mb-6">
        <NetworkStateIndicator showQuality={true} alwaysShow={true} />
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 border rounded-lg">
              <div className={`rounded-full w-3 h-3 mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium">Connection</p>
                <p className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg">
              <div className="mr-2">
                {quality === 'excellent' || quality === 'good' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : quality === 'fair' ? (
                  <Wifi className="h-4 w-4 text-amber-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Quality</p>
                <p className="text-xs text-muted-foreground capitalize">{quality}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg">
              <div className="mr-2">
                {latency && latency < 200 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Latency</p>
                <p className="text-xs text-muted-foreground">{latency ? `${latency}ms` : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Adaptation</TabsTrigger>
          <TabsTrigger value="retry">Retry Mechanism</TabsTrigger>
          <TabsTrigger value="queue">Request Batching</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Network-Aware Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This demo showcases various network-aware features:</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-1 text-green-500" />
                  <span>Content quality adaptation based on connection speed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-1 text-green-500" />
                  <span>Automatic retry with exponential backoff</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-1 text-green-500" />
                  <span>Request batching for poor connections</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-1 text-green-500" />
                  <span>Network status indicators and offline support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <NetworkAwareContainer>
            <Card>
              <CardHeader>
                <CardTitle>Content Quality Adaptation</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Loading {loadingQuality} quality content...</span>
                      <span className="text-sm">{loadingProgress}%</span>
                    </div>
                    <Progress value={loadingProgress} />
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        Quality: {loadingQuality === 'high' 
                          ? 'Full Resolution' 
                          : loadingQuality === 'low' 
                            ? 'Reduced Quality' 
                            : 'Minimal Content'}
                      </span>
                      <span>
                        {loadingQuality === 'high' 
                          ? 'Loading high-quality assets' 
                          : loadingQuality === 'low' 
                            ? 'Loading essential content only'
                            : 'Loading from cache'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="mb-4">Content has been adapted for your current network quality: <strong className="capitalize">{quality}</strong></p>
                    
                    {loadingQuality === 'offline' ? (
                      <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <WifiOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">Offline Mode</h3>
                        <p className="text-sm text-muted-foreground">Showing cached content</p>
                      </div>
                    ) : loadingQuality === 'low' ? (
                      <div className="space-y-4">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                          <p className="text-muted-foreground">Low resolution image placeholder</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-md flex items-center justify-center text-white">
                          <p>High quality image content</p>
                        </div>
                        <p>
                          This content is loading at full quality with all assets. When on a low-quality connection, 
                          the app will automatically reduce image quality, disable animations, and simplify UI elements.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md"></div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button onClick={() => setIsLoading(true)} className="w-full">
                      Reload Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </NetworkAwareContainer>
        </TabsContent>
        
        <TabsContent value="retry">
          <RetryBoundary 
            onRetry={execute}
            retryText="Retry Network Operation"
            errorTitle="Network Operation Failed"
            errorDescription="The operation couldn't be completed due to a network issue."
          >
            <Card>
              <CardHeader>
                <CardTitle>Smart Retry Mechanism</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Test the smart retry mechanism with exponential backoff. The operation has a 50% chance to fail.
                </p>
                
                <div className="flex flex-col space-y-4">
                  <Button onClick={() => execute()} disabled={isRetrying}>
                    {isRetrying ? 'Retrying...' : 'Test Network Operation'}
                  </Button>
                  
                  {error && (
                    <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-md">
                      <p className="text-sm text-red-800 dark:text-red-200">{error.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Retry attempt {retries}/{maxRetries}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </RetryBoundary>
        </TabsContent>
        
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Request Batching & Prioritization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Add requests to the queue with different priority levels. 
                Requests will be batched and processed based on connection quality.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button variant="default" onClick={() => handleQueueRequest('high')}>
                  Add High Priority
                </Button>
                <Button variant="outline" onClick={() => handleQueueRequest('normal')}>
                  Add Normal Priority
                </Button>
                <Button variant="secondary" onClick={() => handleQueueRequest('low')}>
                  Add Low Priority
                </Button>
              </div>
              
              <div className="p-3 border bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-sm mb-2">Request Queue Management:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• High priority requests are processed immediately when online</li>
                  <li>• Low priority requests are batched when on poor connections</li>
                  <li>• Offline requests are queued until connection is restored</li>
                  <li>• Adaptive polling intervals based on network quality</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkAwareDemo;
