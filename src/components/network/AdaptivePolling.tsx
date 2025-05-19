
import React, { useState, useEffect, useRef } from 'react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { getAdaptivePollingInterval } from '@/utils/networkAdaptation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';

interface AdaptivePollingProps {
  baseInterval?: number; // in ms
  onPoll?: () => Promise<any>;
  children?: React.ReactNode;
  showProgress?: boolean;
  className?: string;
  title?: string;
}

const AdaptivePolling: React.FC<AdaptivePollingProps> = ({
  baseInterval = 5000,
  onPoll,
  children,
  showProgress = true,
  className = '',
  title = 'Adaptive Polling'
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [timeToNextPoll, setTimeToNextPoll] = useState<number>(baseInterval);
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const { quality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate adaptive interval based on network quality
  const adaptiveInterval = getAdaptivePollingInterval(baseInterval, quality, isOnline);
  
  const performPoll = async () => {
    if (!isOnline || isPaused) return;
    
    setIsPolling(true);
    
    try {
      if (onPoll) {
        await onPoll();
      }
      setLastPollTime(new Date());
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setIsPolling(false);
      setTimeToNextPoll(adaptiveInterval);
      setProgress(0);
      
      // Schedule next poll
      schedulePoll();
    }
  };
  
  const schedulePoll = () => {
    // Clear any existing timeout
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    
    // Schedule next poll if online and not paused
    if (isOnline && !isPaused) {
      pollTimeoutRef.current = setTimeout(performPoll, adaptiveInterval);
    }
  };
  
  // Update progress counter
  useEffect(() => {
    if (isPaused || !isOnline) return;
    
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up progress tracking interval
    intervalRef.current = setInterval(() => {
      setTimeToNextPoll(prev => {
        const newTime = prev - 100;
        setProgress(((adaptiveInterval - newTime) / adaptiveInterval) * 100);
        return Math.max(0, newTime);
      });
    }, 100);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isOnline, adaptiveInterval]);
  
  // Handle changes to the adaptive interval
  useEffect(() => {
    setTimeToNextPoll(adaptiveInterval);
    
    // If we have an active poll scheduled, reschedule it with the new interval
    if (pollTimeoutRef.current && isOnline && !isPaused) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = setTimeout(performPoll, adaptiveInterval);
    }
  }, [adaptiveInterval, isOnline, isPaused]);
  
  // Initial poll
  useEffect(() => {
    // Perform initial poll
    if (isOnline && !isPaused) {
      performPoll();
    }
    
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between">
          <span>{title}</span>
          <div className="flex items-center text-sm space-x-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{Math.round(adaptiveInterval / 1000)}s</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setIsPaused(prev => !prev)}
            >
              {isPaused ? (
                <PlayCircle className="h-4 w-4" />
              ) : (
                <PauseCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showProgress && !isPaused && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span>Next update in {Math.ceil(timeToNextPoll / 1000)}s</span>
              <span className="text-muted-foreground">
                Network quality: <span className="capitalize">{quality}</span>
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
        
        {showProgress && isPaused && (
          <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground">
            <span>Polling paused</span>
            <Button size="sm" variant="outline" onClick={() => {
              setIsPaused(false);
              performPoll();
            }} className="h-7 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Resume
            </Button>
          </div>
        )}
        
        <div className={isPolling ? 'opacity-50' : ''}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdaptivePolling;
