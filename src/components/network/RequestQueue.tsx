import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNetworkQuality } from '@/responsive/core/hooks';

type RequestQueueContextType = {
  queue: (() => Promise<any>)[];
  enqueue: (request: () => Promise<any>) => void;
  dequeue: () => void;
  isProcessing: boolean;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  queueLength: number;
};

const RequestQueueContext = createContext<RequestQueueContextType | undefined>(undefined);

export const useRequestQueue = () => {
  const context = useContext(RequestQueueContext);
  if (!context) {
    throw new Error('useRequestQueue must be used within a RequestQueueProvider');
  }
  return context;
};

export const RequestQueueManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<(() => Promise<any>)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOnline } = useConnectionStatus();
  const { quality } = useNetworkQuality();
  
  // Enqueue a request
  const enqueue = useCallback((request: () => Promise<any>) => {
    setQueue(prevQueue => [...prevQueue, request]);
    toast.info('Request added to queue', { duration: 3000 });
  }, []);
  
  // Dequeue a request
  const dequeue = useCallback(() => {
    setQueue(prevQueue => prevQueue.slice(1));
  }, []);
  
  // Clear the entire queue
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);
  
  // Process the queue
  const processQueue = useCallback(async () => {
    if (!isOnline || isProcessing || queue.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      while (queue.length > 0 && isOnline) {
        const request = queue[0];
        try {
          await request();
          dequeue();
          toast.success('Request successful', { duration: 3000 });
        } catch (error) {
          console.error('Request failed:', error);
          toast.error('Request failed', { duration: 5000 });
          break; // Stop processing on failure
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isOnline, isProcessing, queue, dequeue]);
  
  // Automatically process queue when online
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);
  
  const contextValue: RequestQueueContextType = {
    queue,
    enqueue,
    dequeue,
    isProcessing,
    processQueue,
    clearQueue,
    queueLength: queue.length,
  };
  
  return (
    <RequestQueueContext.Provider value={contextValue}>
      {children}
    </RequestQueueContext.Provider>
  );
};

export default RequestQueueManager;
