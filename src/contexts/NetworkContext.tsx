
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { ConnectionRecoveryManager } from '@/components/network/ConnectionRecoveryManager';
import { NetworkPredictiveMonitor } from '@/components/network/NetworkPredictiveMonitor';
import { ConnectionStateOverlay } from '@/components/network/ConnectionStateOverlay';

type NetworkContextType = {
  isOnline: boolean;
  connectionType: string | null;
  isLowQuality: boolean;
  quality: string;
  offlineMode: 'auto' | 'on' | 'off';
  setOfflineMode: (mode: 'auto' | 'on' | 'off') => void;
  enableNetworkAlerts: boolean;
  setEnableNetworkAlerts: (enabled: boolean) => void;
  enablePredictiveWarnings: boolean;
  setEnablePredictiveWarnings: (enabled: boolean) => void;
};

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  connectionType: null,
  isLowQuality: false,
  quality: 'unknown',
  offlineMode: 'auto',
  setOfflineMode: () => {},
  enableNetworkAlerts: true,
  setEnableNetworkAlerts: () => {},
  enablePredictiveWarnings: true,
  setEnablePredictiveWarnings: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const [offlineMode, setOfflineMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [enableNetworkAlerts, setEnableNetworkAlerts] = useState(true);
  const [enablePredictiveWarnings, setEnablePredictiveWarnings] = useState(true);
  
  return (
    <NetworkContext.Provider 
      value={{ 
        isOnline, 
        connectionType, 
        isLowQuality,
        quality,
        offlineMode,
        setOfflineMode,
        enableNetworkAlerts,
        setEnableNetworkAlerts,
        enablePredictiveWarnings,
        setEnablePredictiveWarnings
      }}
    >
      <NetworkPredictiveMonitor 
        enablePredictions={enablePredictiveWarnings}
        notifyUser={enableNetworkAlerts}
      >
        <ConnectionRecoveryManager>
          {children}
          
          {enableNetworkAlerts && (
            <ConnectionStateOverlay position="top" autoDismiss={true} />
          )}
        </ConnectionRecoveryManager>
      </NetworkPredictiveMonitor>
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
