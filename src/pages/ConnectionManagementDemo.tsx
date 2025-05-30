import React, { useState, useEffect } from 'react';
import { useNetworkQuality } from '@/responsive/core/hooks';

const ConnectionManagementDemo: React.FC = () => {
  const { quality, metrics } = useNetworkQuality();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Connection Management Demo</h1>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Network Quality: {quality}</p>
      {metrics.latency && <p>Latency: {metrics.latency} ms</p>}
      {metrics.downlink && <p>Downlink: {metrics.downlink} Mbps</p>}
      {metrics.effectiveType && <p>Effective Type: {metrics.effectiveType}</p>}
    </div>
  );
};

export default ConnectionManagementDemo;
