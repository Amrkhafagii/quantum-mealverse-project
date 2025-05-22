
import { Network } from '@capacitor/network';
import { NetworkType, NetworkInfo } from '@/types/unifiedLocation';

/**
 * Get network information
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  try {
    const status = await Network.getStatus();
    let networkType: NetworkType = 'unknown';
    
    if (!status.connected) {
      networkType = 'none';
    } else if (status.connectionType === 'wifi') {
      networkType = 'wifi';
    } else if (status.connectionType === 'cellular') {
      // In a real app, you might want to detect the cellular generation
      networkType = 'cellular_4g';
    }
    
    // Add estimated bandwidth when available
    let estimatedBandwidth: number | undefined;
    
    // Try to get bandwidth from Navigator Connection API if available
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = navigator.connection as any;
      if (connection && typeof connection.downlink === 'number') {
        estimatedBandwidth = connection.downlink * 1000; // Convert Mbps to Kbps
      }
    }
    
    // Check if connection is metered (user pays for data)
    let metered = false;
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = navigator.connection as any;
      if (connection && typeof connection.metered === 'boolean') {
        metered = connection.metered;
      }
    }
    
    return { 
      type: networkType,
      connected: status.connected,
      estimatedBandwidth,
      metered,
      connectionType: status.connectionType
    };
  } catch (err) {
    console.warn('Could not get network info:', err);
    
    // Fallback: Use navigator.onLine
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
    
    return { 
      type: isOnline ? 'unknown' : 'none',
      connected: isOnline,
      connectionType: isOnline ? 'unknown' : 'none'
    };
  }
};

/**
 * Listen for network changes
 * @param callback Function to call when network status changes
 * @returns Cleanup function to remove listener
 */
export const listenForNetworkChanges = (
  callback: (info: NetworkInfo) => void
): (() => void) => {
  let networkListener: any = null;
  
  const setupNetworkListener = async () => {
    try {
      // Get initial status
      const initialInfo = await getNetworkInfo();
      callback(initialInfo);
      
      // Set up Capacitor Network listener
      networkListener = await Network.addListener('networkStatusChange', async () => {
        const updatedInfo = await getNetworkInfo();
        callback(updatedInfo);
      });
      
    } catch (error) {
      console.error('Error setting up network listener:', error);
      
      // Fallback for web: Use online/offline events
      const handleOnline = async () => {
        const info = await getNetworkInfo();
        callback(info);
      };
      
      const handleOffline = () => {
        callback({
          type: 'none',
          connected: false,
          connectionType: 'none'
        });
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Return cleanup function for web fallback
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  };
  
  // Set up the listener
  setupNetworkListener();
  
  // Return cleanup function
  return () => {
    if (networkListener) {
      networkListener.remove();
    }
  };
};

/**
 * Monitor network quality over time
 */
export class NetworkQualityMonitor {
  private latencyHistory: number[] = [];
  private lossHistory: number[] = [];
  private bandwidthHistory: number[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private pingEndpoint: string;
  private activeCheck = false;
  
  constructor(pingEndpoint = '/api/ping') {
    this.pingEndpoint = pingEndpoint;
  }
  
  /**
   * Start monitoring network quality
   * @param callback Function called with quality updates
   * @param intervalMs How often to check (ms)
   */
  public startMonitoring(
    callback: (quality: { latency: number; packetLoss: number; bandwidth?: number }) => void,
    intervalMs = 30000
  ) {
    if (this.intervalId) return; // Already monitoring
    
    const checkQuality = async () => {
      try {
        if (this.activeCheck) return; // Skip if previous check still running
        this.activeCheck = true;
        
        const startTime = performance.now();
        
        // Simple latency test with fetch
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${this.pingEndpoint}?t=${Date.now()}`, {
            method: 'HEAD',
            cache: 'no-store',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const latency = performance.now() - startTime;
            this.recordLatency(latency);
            this.recordLoss(0); // No loss
          } else {
            this.recordLoss(1); // Full loss
          }
        } catch (error) {
          this.recordLoss(1); // Connection error = packet loss
        }
        
        // Get bandwidth estimate from browser API if available
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
          const connection = navigator.connection as any;
          if (connection && typeof connection.downlink === 'number') {
            this.recordBandwidth(connection.downlink * 1000); // Mbps to Kbps
          }
        }
        
        // Calculate aggregates
        const avgLatency = this.getAverageLatency();
        const packetLoss = this.getPacketLoss();
        const avgBandwidth = this.getAverageBandwidth();
        
        this.activeCheck = false;
        
        // Report metrics
        callback({
          latency: avgLatency,
          packetLoss,
          ...(avgBandwidth !== null ? { bandwidth: avgBandwidth } : {})
        });
      } catch (err) {
        console.error('Error checking network quality:', err);
        this.activeCheck = false;
      }
    };
    
    // Run initial check
    checkQuality();
    
    // Set up interval
    this.intervalId = setInterval(checkQuality, intervalMs);
  }
  
  /**
   * Stop monitoring network quality
   */
  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  private recordLatency(latency: number) {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > 10) {
      this.latencyHistory.shift();
    }
  }
  
  private recordLoss(loss: number) {
    this.lossHistory.push(loss);
    if (this.lossHistory.length > 20) {
      this.lossHistory.shift();
    }
  }
  
  private recordBandwidth(bandwidth: number) {
    this.bandwidthHistory.push(bandwidth);
    if (this.bandwidthHistory.length > 5) {
      this.bandwidthHistory.shift();
    }
  }
  
  private getAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 0;
    const sum = this.latencyHistory.reduce((a, b) => a + b, 0);
    return sum / this.latencyHistory.length;
  }
  
  private getPacketLoss(): number {
    if (this.lossHistory.length === 0) return 0;
    const sum = this.lossHistory.reduce((a, b) => a + b, 0);
    return sum / this.lossHistory.length;
  }
  
  private getAverageBandwidth(): number | null {
    if (this.bandwidthHistory.length === 0) return null;
    const sum = this.bandwidthHistory.reduce((a, b) => a + b, 0);
    return sum / this.bandwidthHistory.length;
  }
}

export const networkQualityMonitor = new NetworkQualityMonitor();
