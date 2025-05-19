
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkAwareContainer } from '@/components/network/NetworkAwareContainer';
import { RetryBoundary } from '@/components/network/RetryBoundary';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useRequestQueue } from '@/components/network/RequestQueue';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';
import { WifiOff, RefreshCw, CheckCircle2, Wifi, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NetworkAwareDemo = () => {
  const { toast } = useToast();
  const { isOnline, connectionType } = useConnectionStatus();
  const { queueRequest, pendingCount } = useRequestQueue();
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate an API call
  const mockApiCall = async () => {
    setIsLoading(true);
    try {
      // Simulate fetch with random success/failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Artificially fail 30% of the time when online
          if (Math.random() < 0.3 && isOnline) {
            reject(new Error('API request failed'));
          } else if (!isOnline) {
            reject(new Error('No internet connection'));
          } else {
            resolve('Success');
          }
        }, 1500);
      });
      
      toast({
        title: "Success",
        description: "Operation completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      throw error; // Re-throw to allow RetryBoundary to handle
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use our network retry hook
  const { execute, isRetrying, error, retries, maxRetries, nextRetryTimestamp } = useNetworkRetry(mockApiCall);
  
  // Add to request queue with different priorities
  const addToQueue = (priority: 'high' | 'normal' | 'low') => {
    queueRequest({
      execute: mockApiCall,
      priority,
      maxRetries: 3,
      description: `${priority} priority request`
    });
    
    toast({
      title: "Request Queued",
      description: `Added ${priority} priority request to queue`,
    });
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Network-Aware Components</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Network Status</CardTitle>
          <CardDescription>Real-time network information and indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                {isOnline ? (
                  <Wifi className="h-8 w-8 text-green-500 mb-2" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-500 mb-2" />
                )}
                <p className="font-medium">{isOnline ? 'Online' : 'Offline'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">Connection Type</p>
                <p className="text-lg">{connectionType || 'Unknown'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">Pending Requests</p>
                <p className="text-lg">{pendingCount}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">Retry Progress</p>
                <p className="text-lg">{retries} / {maxRetries}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="network-container">
        <TabsList className="mb-4">
          <TabsTrigger value="network-container">Network Container</TabsTrigger>
          <TabsTrigger value="retry-boundary">Retry Boundary</TabsTrigger>
          <TabsTrigger value="request-queue">Request Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="network-container">
          <Card>
            <CardHeader>
              <CardTitle>Network Aware Container</CardTitle>
              <CardDescription>
                Shows different content based on connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NetworkAwareContainer
                criticalOperation={true}
                onRetry={() => toast({ title: "Retrying", description: "Attempting to reconnect..." })}
              >
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900">
                  <CardContent className="p-6 flex items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                      <h3 className="font-medium">You're online!</h3>
                      <p className="text-sm text-muted-foreground">
                        This content only shows when you have a connection
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </NetworkAwareContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retry-boundary">
          <Card>
            <CardHeader>
              <CardTitle>Retry Boundary</CardTitle>
              <CardDescription>
                Automatically retries failed operations with exponential backoff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RetryBoundary
                onRetry={execute}
                maxRetries={5}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {error ? (
                        <div className="text-amber-500 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          <p>{error.message}</p>
                        </div>
                      ) : (
                        <p className="text-center">
                          Press the button below to test the retry mechanism.
                          <br />
                          <span className="text-sm text-muted-foreground">
                            It will fail ~30% of the time for demonstration.
                          </span>
                        </p>
                      )}
                      
                      <Button
                        onClick={execute}
                        disabled={isRetrying || isLoading}
                      >
                        {isRetrying || isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Test API Call
                          </>
                        )}
                      </Button>
                      
                      {nextRetryTimestamp && (
                        <p className="text-sm text-muted-foreground">
                          Next retry: {new Date(nextRetryTimestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </RetryBoundary>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="request-queue">
          <Card>
            <CardHeader>
              <CardTitle>Request Queue</CardTitle>
              <CardDescription>
                Queue requests with different priority levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Add requests to the queue. They will be processed based on priority when online.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => addToQueue('high')}
                    variant="default"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    High Priority
                  </Button>
                  
                  <Button 
                    onClick={() => addToQueue('normal')}
                    variant="secondary"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Normal Priority
                  </Button>
                  
                  <Button 
                    onClick={() => addToQueue('low')}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Low Priority
                  </Button>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <p className="text-sm">
                    The queue will automatically process requests when online. Check the floating
                    indicator in the bottom right corner to see pending requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkAwareDemo;
