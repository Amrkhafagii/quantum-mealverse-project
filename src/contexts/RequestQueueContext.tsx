
import React, { createContext, useContext, useState } from 'react';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

interface RequestQueueContextType {
  queuedRequests: QueuedRequest[];
  queueRequest: (request: Omit<QueuedRequest, 'id' | 'timestamp'>) => void;
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

  const queueRequest = (request: Omit<QueuedRequest, 'id' | 'timestamp'>) => {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setQueuedRequests(prev => [...prev, queuedRequest]);
  };

  const processQueue = async () => {
    for (const request of queuedRequests) {
      try {
        await fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
    clearQueue();
  };

  const clearQueue = () => {
    setQueuedRequests([]);
  };

  const value: RequestQueueContextType = {
    queuedRequests,
    queueRequest,
    processQueue,
    clearQueue,
  };

  return (
    <RequestQueueContext.Provider value={value}>
      {children}
    </RequestQueueContext.Provider>
  );
};
