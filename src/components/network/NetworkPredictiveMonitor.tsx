import { useEffect, useState, useCallback, useRef } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

interface NetworkPredictiveMonitorProps {
  children?: React.ReactNode;
  enablePredictions?: boolean;
  sensitivityLevel?: 'low' | 'medium' | 'high';
  notifyUser?: boolean;
}

export function NetworkPredictiveMonitor({
  children,
  enablePredictions = true,
  sensitivityLevel = 'medium',
  notifyUser = true
}: NetworkPredictiveMonitorProps) {
  const { isOnline, connectionType } = useConnectionStatus();
  const { latency, quality, isFlaky } = useNetworkQuality();
  const [degradingConnection, setDegradingConnection] = useState(false);
  const latencyHistory = useRef<number[]>([]);
  const qualityHistory = useRef<string[]>([]);
  const lastWarningTime = useRef<number | null>(null);
  
  // Convert sensitivity level to numerical thresholds
  const thresholds = {
    low: { 
      latencyJump: 100, 
      consistentDegradation: 5,
      warningCooldown: 60000 // 60 seconds
    },
    medium: { 
      latencyJump: 70, 
      consistentDegradation: 3,
      warningCooldown: 30000 // 30 seconds
    },
    high: { 
      latencyJump: 40, 
      consistentDegradation: 2,
      warningCooldown: 15000 // 15 seconds
    }
  }[sensitivityLevel];
  
  // Detect if we're in a tunnel or elevator based on connection patterns
  const detectMobilityIssues = useCallback(() => {
    if (!isOnline || connectionType !== 'cellular') return false;
    
    // Check rapid latency increases which often happen when entering tunnels/elevators
    if (latencyHistory.current.length >= 3) {
      const recent = latencyHistory.current.slice(-3);
      const increasing = recent[1] > recent[0] && recent[2] > recent[1];
      const rapidIncrease = recent[2] - recent[0] > thresholds.latencyJump;
      
      if (increasing && rapidIncrease) {
        return true;
      }
    }
    
    return false;
  }, [isOnline, connectionType, thresholds.latencyJump]);
  
  // Analyze connection patterns to predict potential issues
  const analyzeConnectionPatterns = useCallback(() => {
    if (!enablePredictions || !isOnline) return;
    
    // Check for mobility issues (tunnels, elevators)
    const mobilityIssue = detectMobilityIssues();
    
    // Check for consistent quality degradation
    let degradingQuality = false;
    if (qualityHistory.current.length >= thresholds.consistentDegradation) {
      const recentQualities = qualityHistory.current.slice(-thresholds.consistentDegradation);
      const qualities = ['unknown', 'very-poor', 'poor', 'fair', 'good', 'excellent'];
      
      // Check if quality is consistently decreasing
      let decreasing = true;
      for (let i = 1; i < recentQualities.length; i++) {
        const prevIndex = qualities.indexOf(recentQualities[i-1]);
        const currentIndex = qualities.indexOf(recentQualities[i]);
        
        if (currentIndex >= prevIndex) {
          decreasing = false;
          break;
        }
      }
      
      degradingQuality = decreasing;
    }
    
    // Determine if we should warn about degrading connection
    const shouldWarn = mobilityIssue || degradingQuality;
    
    // Only update state if it's changing
    if (shouldWarn !== degradingConnection) {
      setDegradingConnection(shouldWarn);
      
      // Show notification if needed and cooldown period has passed
      const now = Date.now();
      if (shouldWarn && notifyUser && 
          (!lastWarningTime.current || now - lastWarningTime.current > thresholds.warningCooldown)) {
        toast({
          title: "Connection Warning",
          description: mobilityIssue 
            ? "You may be entering an area with poor connectivity."
            : "Your connection quality is degrading rapidly.",
          variant: "warning",
          duration: 5000,
          action: (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )
        });
        
        lastWarningTime.current = now;
      }
    }
  }, [enablePredictions, isOnline, detectMobilityIssues, notifyUser, thresholds, degradingConnection]);
  
  // Track network metrics history
  useEffect(() => {
    if (!isOnline) {
      // Clear history when offline
      latencyHistory.current = [];
      qualityHistory.current = [];
      return;
    }
    
    // Track latency if available
    if (latency) {
      latencyHistory.current.push(latency);
      // Keep last 10 measurements
      if (latencyHistory.current.length > 10) {
        latencyHistory.current.shift();
      }
    }
    
    // Track connection quality
    qualityHistory.current.push(quality);
    if (qualityHistory.current.length > 10) {
      qualityHistory.current.shift();
    }
    
    // Analyze patterns to predict issues
    analyzeConnectionPatterns();
    
  }, [isOnline, latency, quality, analyzeConnectionPatterns]);
  
  // Return children since this is just a monitoring component
  return children || null;
}

export default NetworkPredictiveMonitor;
