import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/responsive/core/hooks';
import { NetworkStateIndicator } from '@/components/orders/status/NetworkStateIndicator';

interface ResilientNetworkDemoProps {
  // No props needed for this demo
}

const ResilientNetworkDemo: React.FC<ResilientNetworkDemoProps> = () => {
  const { isOnline, connectionType, wasOffline, resetWasOffline } = useConnectionStatus();
  const { quality, isLowQuality, metrics, hasTransitioned, isFlaky, latency, bandwidth, checkQuality } = useNetworkQuality();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate fetching data from an API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!isOnline) {
        throw new Error('Offline mode: Cannot fetch data.');
      }
      
      // Simulate successful data fetch
      setData({
        timestamp: new Date().toLocaleTimeString(),
        message: 'Data fetched successfully!',
        connection: connectionType || 'Unknown',
        quality: quality
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (wasOffline) {
      alert('Back online! Connection restored.');
      resetWasOffline();
    }
  }, [wasOffline, resetWasOffline]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resilient Network Demo</CardTitle>
        <CardDescription>
          Demonstrates handling different network states and qualities.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <NetworkStateIndicator alwaysShow={true} />
        
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? 'outline' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          {isFlaky && (
            <Badge variant="secondary">
              Unstable Connection
            </Badge>
          )}
          
          {isLowQuality && (
            <Badge variant="destructive">
              Low Quality: {quality}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Connection Details:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Type: {connectionType || 'Unknown'}</li>
            <li>Quality: {quality}</li>
            <li>Latency: {metrics.latency ? `${metrics.latency}ms` : 'N/A'}</li>
            <li>Bandwidth: {metrics.bandwidth ? `${metrics.bandwidth} Mbps` : 'N/A'}</li>
          </ul>
        </div>
        
        <Button onClick={fetchData} disabled={isLoading || !isOnline}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            'Fetch Data'
          )}
        </Button>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {data && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              {data.message} (Fetched at {data.timestamp})
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ResilientNetworkDemo;
