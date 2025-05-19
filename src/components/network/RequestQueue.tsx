import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Minus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface QueueableRequest {
  id: string;
  execute: () => Promise<any>;
  priority: 'high' | 'normal' | 'low';
  retries: number;
  maxRetries: number;
  lastError?: string;
  description: string;
}

interface RequestQueueProviderProps {
  children: React.ReactNode;
}

export const RequestQueueContext = React.createContext<{
  queueRequest: (request: Omit<QueueableRequest, 'id' | 'retries'>) => string;
  cancelRequest: (id: string) => void;
  isPending: boolean;
  pendingCount: number;
  processNow: () => void;
}>({
  queueRequest: () => '',
  cancelRequest: () => {},
  isPending: false,
  pendingCount: 0,
  processNow: () => {},
});

export const RequestQueueProvider: React.FC<RequestQueueProviderProps> = ({ children }) => {
  const [queue, setQueue] = useState<QueueableRequest[]>([]);
  const [isPending, setIsPending] = useState(false);
  const { isOnline } = useConnectionStatus();
  const { toast } = useToast();
  
  // Queue a new request
  const queueRequest = (request: Omit<QueueableRequest, 'id' | 'retries'>): string => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newRequest: QueueableRequest = {
      ...request,
      id,
      retries: 0,
    };
    
    setQueue(prevQueue => {
      // Sort by priority when adding
      const updatedQueue = [...prevQueue, newRequest].sort((a, b) => {
        const priorityValues = { high: 0, normal: 1, low: 2 };
        return priorityValues[a.priority] - priorityValues[b.priority];
      });
      
      return updatedQueue;
    });
    
    // If request has high priority and we're online, process the queue immediately
    if (request.priority === 'high' && isOnline && !isPending) {
      setTimeout(() => processQueue(), 0);
    }
    
    return id;
  };
  
  // Cancel a request by ID
  const cancelRequest = (id: string) => {
    setQueue(prevQueue => prevQueue.filter(req => req.id !== id));
  };
  
  // Process all requests in the queue
  const processQueue = async () => {
    if (!isOnline || isPending || queue.length === 0) {
      return;
    }
    
    setIsPending(true);
    let successCount = 0;
    let failCount = 0;
    
    // Process requests by priority
    const sortedQueue = [...queue].sort((a, b) => {
      const priorityValues = { high: 0, normal: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    });
    
    for (const request of sortedQueue) {
      try {
        await request.execute();
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
    if (successCount > 0 || failCount > 0) {
      toast({
        title: 'Queue processed',
        description: `${successCount} succeeded, ${failCount} failed.`,
        variant: failCount === 0 ? 'default' : 'destructive',
      });
    }
  };
  
  // Process the queue when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isPending) {
      const timer = setTimeout(() => processQueue(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isPending]);
  
  // Process high priority items every 10 seconds if online
  useEffect(() => {
    if (isOnline && !isPending) {
      const highPriorityExists = queue.some(req => req.priority === 'high');
      
      if (highPriorityExists) {
        const timer = setTimeout(() => processQueue(), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, queue, isPending]);
  
  const contextValue = {
    queueRequest,
    cancelRequest,
    isPending,
    pendingCount: queue.length,
    processNow: processQueue
  };
  
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
}

// Component to display and manage the queue
export const RequestQueueManager: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { pendingCount, isPending, processNow } = useRequestQueue();
  const { isOnline } = useConnectionStatus();
  
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
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <span className="text-sm font-medium">
                {pendingCount} pending
              </span>
            </div>
            
            <Progress
              value={isPending ? ((pendingCount - 1) / pendingCount) * 100 : 0}
              className="h-2"
            />
          </CardContent>
          
          <CardFooter className="pt-0">
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
          </CardFooter>
        </Card>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="rounded-full shadow-lg"
          onClick={() => setIsExpanded(true)}
          disabled={isPending}
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {pendingCount} Pending
        </Button>
      )}
    </div>
  );
};

export default RequestQueueProvider;
