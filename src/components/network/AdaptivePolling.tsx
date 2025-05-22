
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { getAdaptivePollingInterval } from '@/utils/networkAdaptation';
import { useBatteryMonitor } from '@/utils/batteryMonitor';
import { NetworkAwareContainer } from './NetworkAwareContainer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdaptivePollingProps {
  children?: React.ReactNode;
  title?: string;
  baseInterval?: number;
  onPoll?: () => Promise<any>;
  showControls?: boolean;
  initiallyEnabled?: boolean;
}

export default function AdaptivePolling({
  children,
  title = 'Adaptive Polling',
  baseInterval = 5000,
  onPoll,
  showControls = true,
  initiallyEnabled = false
}: AdaptivePollingProps) {
  const { quality, isOnline } = useNetworkQuality();
  const { batteryLevel } = useBatteryMonitor();
  const [isPolling, setIsPolling] = useState(initiallyEnabled);
  const [adaptiveInterval, setAdaptiveInterval] = useState(baseInterval);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [nextPollTime, setNextPollTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate adaptive polling interval based on network quality
  useEffect(() => {
    const interval = getAdaptivePollingInterval(
      baseInterval,
      quality,
      isOnline,
      batteryLevel
    );
    setAdaptiveInterval(interval);
  }, [quality, isOnline, batteryLevel, baseInterval]);
  
  // Polling function
  const poll = useCallback(async () => {
    if (!isPolling || !onPoll || !isOnline) return;
    
    setIsLoading(true);
    setLastPollTime(new Date());
    
    try {
      await onPoll();
    } catch (error) {
      console.error('Error polling:', error);
    } finally {
      setIsLoading(false);
      // Schedule next poll
      const nextTime = new Date();
      nextTime.setTime(nextTime.getTime() + adaptiveInterval);
      setNextPollTime(nextTime);
    }
  }, [isPolling, onPoll, adaptiveInterval, isOnline]);
  
  // Set up polling interval
  useEffect(() => {
    if (!isPolling) {
      setNextPollTime(null);
      return;
    }
    
    // Initial poll
    poll();
    
    // Set up interval for regular polling
    const intervalId = setInterval(() => {
      poll();
    }, adaptiveInterval);
    
    return () => clearInterval(intervalId);
  }, [isPolling, poll, adaptiveInterval]);
  
  const togglePolling = () => {
    setIsPolling(prev => !prev);
  };
  
  return (
    <NetworkAwareContainer>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {showControls && (
            <div className="mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Polling interval: <span className="font-medium">{adaptiveInterval / 1000}s</span>
                </p>
                {lastPollTime && (
                  <p className="text-xs text-muted-foreground">
                    Last poll: {lastPollTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <Button
                variant={isPolling ? "default" : "outline"}
                onClick={togglePolling}
                size="sm"
                className="ml-2"
                disabled={!isOnline && isPolling}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Polling...
                  </>
                ) : isPolling ? 'Stop Polling' : 'Start Polling'}
              </Button>
            </div>
          )}
          
          {children}
        </CardContent>
      </Card>
    </NetworkAwareContainer>
  );
}
