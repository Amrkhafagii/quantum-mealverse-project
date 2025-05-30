import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetworkQuality } from '@/responsive/core/hooks';

interface NetworkContextType {
  networkStatus: string;
  latency: number | null;
  downlink: number | null;
  rtt: number | null;
}

const NetworkContext = createContext<NetworkContextType>({
  networkStatus: 'unknown',
  latency: null,
  downlink: null,
  rtt: null,
});

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const { quality, metrics } = useNetworkQuality();
  const [networkStatus, setNetworkStatus] = useState<string>('unknown');
  const [latency, setLatency] = useState<number | null>(null);
  const [downlink, setDownlink] = useState<number | null>(null);
  const [rtt, setRtt] = useState<number | null>(null);

  useEffect(() => {
    setNetworkStatus(quality);
    setLatency(metrics.latency || null);
    setDownlink(metrics.downlink || null);
    setRtt(metrics.rtt || null);
  }, [quality, metrics]);

  const networkContextValue: NetworkContextType = {
    networkStatus,
    latency,
    downlink,
    rtt,
  };

  return (
    <NetworkContext.Provider value={networkContextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
};
