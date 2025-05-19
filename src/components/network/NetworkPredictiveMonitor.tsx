import React, { useEffect, useState, useCallback } from 'react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useToast } from '@/hooks/use-toast';
import { WifiOff, AlertTriangle } from 'lucide-react';

interface NetworkPredictionConfig {
  pollIntervalMs?: number;
  latencyThreshold?: number;
  packetLossThreshold?: number;
  useHeuristics?: boolean;
}

interface NetworkPredictiveMonitorProps {
  children: React.ReactNode;
  enablePredictions?: boolean;
  notifyUser?: boolean;
  config?: NetworkPredictionConfig;
}

export function NetworkPredictiveMonitor({
  children,
  enablePredictions = true,
  notifyUser = true,
  config = {}
}: NetworkPredictiveMonitorProps) {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, latency, isFlaky } = useNetworkQuality();
  const [predictionActive, setPredictionActive] = useState(false);
  const [possibleDisconnection, setPossibleDisconnection] = useState(false);
  const { toast } = useToast();
  
  const {
    pollIntervalMs = 5000,
    latencyThreshold = 800,
    packetLossThreshold = 15,
    useHeuristics = true
  } = config;
  
  // Function to predict possible connection issues
  const checkForPotentialIssues = useCallback(() => {
    if (!enablePredictions || !isOnline) return;
    
    const isHighLatency = latency && latency > latencyThreshold;
    // Set a default value for packet loss since it might not exist in the type
    const estimatedPacketLoss = isFlaky ? 20 : 0;
    const isHighPacketLoss = estimatedPacketLoss > packetLossThreshold;
    
    let isPotentialDisconnect = false;
    
    // Check if we're on a connection type that might have issues
    if (useHeuristics) {
      // Potential issues when in tunnels, elevators, etc.
      if (connectionType === 'cellular' && quality === 'poor' && (isHighLatency || isHighPacketLoss)) {
        isPotentialDisconnect = true;
      }
      
      // Unstable WiFi when signal is weak
      if (connectionType === 'wifi' && quality === 'poor' && isHighPacketLoss) {
        isPotentialDisconnect = true;
      }
    } else {
      // Simple check based on metrics only
      isPotentialDisconnect = isHighLatency && isHighPacketLoss;
    }
    
    // Update state if prediction changes
    if (isPotentialDisconnect !== possibleDisconnection) {
      setPossibleDisconnection(isPotentialDisconnect);
      
      // Notify the user if needed
      if (isPotentialDisconnect && notifyUser) {
        toast({
          title: "Possible connection issue ahead",
          description: "Your network quality is deteriorating. You might experience connection issues soon.",
          variant: "default",
          duration: 5000,
          action: (
            <div className="flex items-center justify-center w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          ),
        });
      }
    }
  }, [
    enablePredictions, 
    isOnline, 
    connectionType, 
    quality, 
    latency,
    isFlaky, 
    latencyThreshold,
    packetLossThreshold,
    useHeuristics, 
    possibleDisconnection, 
    notifyUser,
    toast
  ]);
  
  // Set up polling for connection prediction
  useEffect(() => {
    if (!enablePredictions) {
      setPredictionActive(false);
      return;
    }
    
    setPredictionActive(true);
    
    // Initial check
    checkForPotentialIssues();
    
    // Set up interval for regular checks
    const interval = setInterval(() => {
      checkForPotentialIssues();
    }, pollIntervalMs);
    
    return () => clearInterval(interval);
  }, [enablePredictions, checkForPotentialIssues, pollIntervalMs]);
  
  // Return children with no blocking overlay
  return (
    <>
      {children}
      
      {/* We don't render any visible UI here, just keep track of state */}
      {predictionActive && possibleDisconnection && (
        <div className="sr-only" aria-hidden="true">
          Connection warning active
        </div>
      )}
    </>
  );
}

export default NetworkPredictiveMonitor;
