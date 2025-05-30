
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Minus, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { retryWithBackoff, BackoffOptions, DEFAULT_BACKOFF_OPTIONS } from '@/utils/retryWithExponentialBackoff';
import { compressData, decompressData, shouldCompress, prepareBatchForTransmission } from '@/utils/dataCompression';
import { useSyncStrategy, SyncStrategy } from '@/utils/syncStrategyManager';
import { ConflictStrategy, detectConflict, resolveConflict } from '@/utils/conflictResolution';

export interface QueueableRequest {
  id: string;
  execute: () => Promise<any>;
  priority: 'high' | 'normal' | 'low';
  retries: number;
  maxRetries: number;
  lastError?: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, any>;
  compressionEnabled?: boolean;
  conflictResolutionStrategy?: ConflictStrategy;
  data?: any;
}

interface RequestQueueProviderProps {
  children: React.ReactNode;
  retryConfig?: BackoffOptions;
  autoProcessInterval?: number;
  compressionThreshold?: number;
}

export const RequestQueueContext = React.createContext<{
  queueRequest: (request: Omit<QueueableRequest, 'id' | 'retries' | 'timestamp'>) => string;
  cancelRequest: (id: string) => void;
  isPending: boolean;
  pendingCount: number;
  processNow: () => void;
  clearQueue: () => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  isPaused: boolean;
}>({
  queueRequest: () => '',
  cancelRequest: () => {},
  isPending: false,
  pendingCount: 0,
  processNow: () => {},
  clearQueue: () => {},
  pauseQueue: () => {},
  resumeQueue: () => {},
  isPaused: false,
});

export const RequestQueueProvider: React.FC<RequestQueueProviderProps> = ({ 
  children, 
  retryConfig = DEFAULT_BACKOFF_OPTIONS,
  autoProcessInterval = 30000, // 30 seconds default
  compressionThreshold = 1024, // 1KB default
}) => {
  const [queue, setQueue] = useState<QueueableRequest[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const { toast } = useToast();
  const { syncConfig, isStrategyActive } = useSyncStrategy();
  
  // Generate a unique request ID
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Determine if we should use compression based on current sync strategy
  const shouldUseCompression = useMemo(() => {
    return isStrategyActive(SyncStrategy.COMPRESSED);
  }, [isStrategyActive]);
  
  // Queue a new request
  const queueRequest = useCallback((request: Omit<QueueableRequest, 'id' | 'retries' | 'timestamp'>): string => {
    const id = generateRequestId();
    
    // Apply compression if needed
    const shouldCompressData = shouldUseCompression && 
      request.data && 
      (request.compressionEnabled ?? true) && 
      shouldCompress(request.data);
    
    const newRequest: QueueableRequest = {
      ...request,
      id,
      retries: 0,
      timestamp: Date.now(),
      compressionEnabled: shouldCompressData
    };
    
    // If compression should be applied and we have data, compress it
    if (shouldCompressData && request.data) {
      // Wrap in promise to not block UI
      Promise.resolve().then(async () => {
        try {
          const compressedData = await compressData(request.data);
          
          // Update the request with compressed data
          setQueue(prevQueue => {
            return prevQueue.map(queuedRequest => {
              if (queuedRequest.id === id) {
                return {
                  ...queuedRequest,
                  data: compressedData,
                  metadata: { 
                    ...queuedRequest.metadata,
                    isCompressed: true,
                    originalSize: JSON.stringify(request.data).length,
                    compressedSize: compressedData.length
                  }
                };
              }
              return queuedRequest;
            });
          });
        } catch (error) {
          console.error('Failed to compress request data:', error);
        }
      });
    }
    
    setQueue(prevQueue => {
      // Sort by priority when adding
      const updatedQueue = [...prevQueue, newRequest].sort((a, b) => {
        const priorityValues = { high: 0, normal: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
      });
      
      return updatedQueue;
    });
    
    // If request has high priority and we're online, process the queue immediately
    if (request.priority === 'high' && isOnline && !isPending && !isPaused) {
      setTimeout(() => processQueue(), 0);
    }
    
    return id;
  }, [generateRequestId, isOnline, isPending, isPaused, shouldUseCompression]);
  
  // Cancel a request by ID
  const cancelRequest = useCallback((id: string) => {
    setQueue(prevQueue => prevQueue.filter(req => req.id !== id));
  }, []);
  
  // Process all requests in the queue
  const processQueue = useCallback(async () => {
    if (!isOnline || isPending || queue.length === 0 || isPaused) {
      return;
    }
    
    setIsPending(true);
    let successCount = 0;
    let failCount = 0;
    
    // Get adaptive retry config based on network quality
    const adaptiveRetryConfig: BackoffOptions = {
      ...retryConfig,
      // Increase base delay for poor connections
      initialDelayMs: isLowQuality 
        ? retryConfig.initialDelayMs * 2 
        : retryConfig.initialDelayMs,
      // More jitter for unstable connections
      jitterFactor: connectionType === 'wifi' ? 0.2 : 0.3
    };
    
    // Process requests by priority
    const sortedQueue = [...queue].sort((a, b) => {
      const priorityValues = { high: 0, normal: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    });
    
    // If in batch mode, group similar requests
    const shouldBatch = isStrategyActive(SyncStrategy.BATCH);
    
    if (shouldBatch && sortedQueue.length > 1) {
      // Here we could implement batching logic
      // For now, we'll still process sequentially
    }
    
    for (const request of sortedQueue) {
      try {
        // If data is compressed, decompress before execution
        if (request.metadata?.isCompressed && request.data) {
          try {
            request.data = await decompressData(request.data);
          } catch (decompressError) {
            console.error('Failed to decompress request data:', decompressError);
            // Continue with execution using compressed data as fallback
          }
        }
        
        // Use the retry with backoff utility for resilient requests
        await retryWithBackoff(
          async () => await request.execute(),
          {
            ...adaptiveRetryConfig,
            maxRetries: request.maxRetries || adaptiveRetryConfig.maxRetries
          }
        );
        
        successCount++;
        
        // Remove completed request from queue
        setQueue(prev => prev.filter(r => r.id !== request.id));
      } catch (error) {
        failCount++;
        
        // Increment retry count and update last error
        setQueue(prev => prev.map(r => {
          if (r.id === request.id) {
            const updatedRetries = r.retries + 1;
            const hasExceededMaxRetries = updatedRetries >= r.maxRetries;
            
            // If exceeded max retries, remove from queue
            if (hasExceededMaxRetries) {
              toast({
                title: 'Operation failed',
                description: `${r.description} failed after ${r.maxRetries} attempts.`,
                variant: 'destructive',
              });
              
              return r; // Will be filtered out next
            }
            
            return {
              ...r,
              retries: updatedRetries,
              lastError: error instanceof Error ? error.message : String(error)
            };
          }
          return r;
        }));
        
        // Remove requests that have exceeded max retries
        setQueue(prev => prev.filter(r => r.retries < r.maxRetries));
      }
    }
    
    setIsPending(false);
    
    // Show completion notification
    if ((successCount > 0 || failCount > 0) && (successCount + failCount) > 1) {
      toast({
        title: 'Queue processed',
        description: `${successCount} succeeded, ${failCount} failed.`,
        variant: failCount === 0 ? 'default' : 'destructive',
      });
    }
  }, [isOnline, isPending, queue.length, isPaused, retryConfig, isLowQuality, connectionType, isStrategyActive, toast]);

  // Pause the queue processing
  const pauseQueue = useCallback(() => {
    setIsPaused(true);
    toast({
      title: 'Queue paused',
      description: 'Request processing has been paused.',
    });
  }, [toast]);
  
  // Resume the queue processing
  const resumeQueue = useCallback(() => {
    setIsPaused(false);
    toast({
      title: 'Queue resumed',
      description: 'Request processing has been resumed.',
    });
    
    // Attempt to process queue if we have items and we're online
    if (queue.length > 0 && isOnline && !isPending) {
      setTimeout(() => processQueue(), 1000);
    }
  }, [queue.length, isOnline, isPending, processQueue, toast]);
  
  // Clear all requests from the queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    toast({
      title: 'Queue cleared',
      description: 'All pending requests have been removed.',
    });
  }, [toast]);

  // Process the queue when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isPending && !isPaused) {
      const timer = setTimeout(() => processQueue(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isPending, isPaused, processQueue]);
  
  // Process the queue periodically based on sync config
  useEffect(() => {
    if (!isPaused && isOnline && queue.length > 0 && !isPending) {
      // Use the sync interval from the sync config
      const interval = syncConfig.syncInterval || autoProcessInterval;
      
      const timer = setTimeout(() => processQueue(), interval);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isPending, isPaused, processQueue, syncConfig, autoProcessInterval]);
  
  // Context value
  const contextValue = useMemo(() => ({
    queueRequest,
    cancelRequest,
    isPending,
    pendingCount: queue.length,
    processNow: processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused
  }), [queueRequest, cancelRequest, isPending, queue.length, processQueue, clearQueue, pauseQueue, resumeQueue, isPaused]);
  
  return (
    <RequestQueueContext.Provider value={contextValue}>
      {children}
    </RequestQueueContext.Provider>
  );
};

export const useRequestQueue = () => {
  return React.useContext(RequestQueueContext);
};

// Update the RequestExecutor interface to properly handle Promise<unknown>
export interface RequestExecutor {
  execute: () => Promise<any>; // Allow any return type for execute
  priority: 'high' | 'normal' | 'low';
  maxRetries?: number;
  description?: string;
  metadata?: Record<string, any>;
  data?: any;
  compressionEnabled?: boolean;
  conflictResolutionStrategy?: ConflictStrategy;
}

// Enhanced queue manager component with more detailed status information
export const RequestQueueManager: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { pendingCount, isPending, processNow, isPaused, pauseQueue, resumeQueue, clearQueue } = useRequestQueue();
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  
  if (pendingCount === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
              <span>Request Queue</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsExpanded(false)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm">
                  {isOnline ? connectionType || 'Online' : 'Offline'}
                </span>
              </div>
              <Badge variant={isLowQuality ? "outline" : "default"}>
                {quality || 'Unknown'} quality
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
              </span>
              <span className="text-sm text-muted-foreground">
                {isPaused ? 'Paused' : (isPending ? 'Processing...' : 'Idle')}
              </span>
            </div>
            
            <Progress
              value={isPending ? ((pendingCount - 1) / pendingCount) * 100 : 0}
              className="h-2"
            />
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-0">
            <Button
              className="w-full"
              size="sm"
              disabled={!isOnline || isPending || pendingCount === 0}
              onClick={processNow}
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Now
                </>
              )}
            </Button>
            
            <div className="flex gap-2 w-full">
              {isPaused ? (
                <Button
                  className="flex-1"
                  size="sm"
                  variant="outline"
                  onClick={resumeQueue}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  size="sm"
                  variant="outline"
                  onClick={pauseQueue}
                  disabled={isPending}
                >
                  Pause
                </Button>
              )}
              
              <Button
                className="flex-1"
                size="sm"
                variant="destructive"
                onClick={clearQueue}
                disabled={isPending}
              >
                Clear
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Button
          variant="default"
          size="sm"
          className={`rounded-full shadow-lg ${isPaused ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          onClick={() => setIsExpanded(true)}
          disabled={isPending}
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : isPaused ? (
            <AlertCircle className="h-4 w-4 mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {pendingCount} {isPaused ? 'Paused' : 'Pending'}
        </Button>
      )}
    </div>
  );
};

export default RequestQueueProvider;
