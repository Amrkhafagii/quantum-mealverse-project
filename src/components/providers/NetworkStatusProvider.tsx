
import React, { createContext, useContext } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality, NetworkQuality } from '@/hooks/useNetworkQuality';

interface NetworkStatusContextType {
  isOnline: boolean;
  connectionType: string | null;
  wasOffline: boolean;
  resetWasOffline: () => void;
  quality: NetworkQuality;
  isLowQuality: boolean;
  isFlaky: boolean;
  hasTransitioned: boolean;
  latency: number | null;
  bandwidth: number | null;
  checkQuality: () => Promise<void>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | null>(null);

export const useNetworkStatus = (): NetworkStatusContextType => {
  const context = useContext(NetworkStatusContext);
  
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  
  return context;
};

interface NetworkStatusProviderProps {
  children: React.ReactNode;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ children }) => {
  const connectionStatus = useConnectionStatus();
  const networkQuality = useNetworkQuality();
  
  const value = {
    ...connectionStatus,
    ...networkQuality
  };
  
  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
