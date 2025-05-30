
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface QueuedRequest {
  id: string;
  data: any;
  timestamp: number;
  retries: number;
}

export interface RequestQueueContextType {
  queuedRequests: QueuedRequest[];
  queueRequest: (data: any) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

const RequestQueueContext = createContext<RequestQueueContextType | undefined>(undefined);

export const useRequestQueue = () => {
  const context = useContext(RequestQueueContext);
  if (!context) {
    throw new Error('useRequestQueue must be used within a RequestQueueProvider');
  }
  return context;
};

interface RequestQueueProviderProps {
  children: React.ReactNode;
}

export const RequestQueueProvider: React.FC<RequestQueueProviderProps> = ({ children }) => {
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([]);

  const queueRequest = useCallback((data: any) => {
    const newRequest: QueuedRequest = {
      id: Date.now().toString(),
      data,
      timestamp: Date.now(),
      retries: 0
    };
    
    setQueuedRequests(prev => [...prev, newRequest]);
  }, []);

  const processQueue = useCallback(async () => {
    // Process queued requests
    for (const request of queuedRequests) {
      try {
        // Process the request
        console.log('Processing request:', request);
        // Remove from queue on success
        setQueuedRequests(prev => prev.filter(r => r.id !== request.id));
      } catch (error) {
        console.error('Failed to process request:', error);
        // Update retry count
        setQueuedRequests(prev => 
          prev.map(r => 
            r.id === request.id 
              ? { ...r, retries: r.retries + 1 }
              : r
          )
        );
      }
    }
  }, [queuedRequests]);

  const clearQueue = useCallback(() => {
    setQueuedRequests([]);
  }, []);

  return (
    <RequestQueueContext.Provider 
      value={{
        queuedRequests,
        queueRequest,
        processQueue,
        clearQueue
      }}
    >
      {children}
    </RequestQueueContext.Provider>
  );
};
