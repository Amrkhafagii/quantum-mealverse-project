
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Bug, AlertTriangle, Clock, CheckCircle2, WifiOff } from 'lucide-react';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { toast } from '@/components/ui/use-toast';

interface MobileStatusDebugProps {
  orderId: string;
  onStatusFixed: () => void;
}

export const MobileStatusDebug: React.FC<MobileStatusDebugProps> = ({ 
  orderId,
  onStatusFixed
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState<Date | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<boolean>(false);
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isFlaky } = useNetworkQuality();
  
  // Reset retrying state when connection is back
  useEffect(() => {
    if (isOnline && retrying) {
      // Give a small delay to ensure connection is stable
      const timer = setTimeout(() => {
        if (isOnline) {
          setRetrying(false);
          
          // Auto-retry if we were previously attempting
          if (lastAttemptTime && Date.now() - lastAttemptTime.getTime() < 30000) { // Within 30 seconds
            handleQuickFix();
          }
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, retrying]);
  
  // Quick fix function with retry capability
  const handleQuickFix = async () => {
    if (!isOnline) {
      // Queue for later if offline
      setOfflineQueue(true);
      toast({
        title: "Action queued",
        description: "Will fix order status when back online",
        variant: "default"
      });
      hapticFeedback.medium();
      return;
    }
    
    setIsLoading(true);
    hapticFeedback.medium();
    setLastAttemptTime(new Date());
    setAttemptCount(prev => prev + 1);
    
    try {
      // Adjustable timeout based on network quality
      const timeout = quality === 'poor' || quality === 'very-poor' ? 10000 : 5000;
      
      // Use Promise.race to implement timeout
      const result = await Promise.race([
        fixOrderStatus(orderId),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error("Network request timed out")), timeout)
        )
      ]);
      
      if (result) {
        toast({
          title: "Status fixed",
          description: "Order status has been synchronized",
          variant: "default"
        });
        hapticFeedback.success();
        setOfflineQueue(false);
        onStatusFixed();
      }
    } catch (error) {
      console.error('Error fixing order status:', error);
      
      // Handle the error differently based on whether we're online
      if (!isOnline) {
        setRetrying(true);
        toast({
          title: "Connection lost",
          description: "Will retry when back online",
          variant: "destructive"
        });
      } else if (isFlaky) {
        toast({
          title: "Unstable connection",
          description: "Network is unstable, try again when stable",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Fix failed",
          description: "Could not fix order status",
          variant: "destructive"
        });
      }
      
      hapticFeedback.error();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle debug panel
  const toggleDebugPanel = () => {
    setIsOpen(prev => !prev);
    hapticFeedback.light();
  };

  // Auto-attempt if queued action and we come back online
  useEffect(() => {
    if (isOnline && offlineQueue) {
      const timer = setTimeout(() => {
        handleQuickFix();
      }, 1500); // Small delay to ensure connection is stable
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineQueue]);
  
  return (
    <div className="mt-4 px-1">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleDebugPanel}
          className="text-xs flex items-center gap-1 text-muted-foreground"
        >
          <Bug className="h-3 w-3" />
          {isOpen ? 'Hide debug' : 'Debug tools'}
        </Button>
        
        {process.env.NODE_ENV === 'development' && (
          <Badge variant="outline" className="text-xs">DEV</Badge>
        )}
        
        {isFlaky && (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Unstable
          </Badge>
        )}
      </div>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-muted/30 rounded-md space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID: </span>
            <span className="font-mono">{orderId.substring(0, 8)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connection: </span>
            <span className={isOnline ? "text-green-500" : "text-amber-500"}>
              {isOnline ? 'Online' : 'Offline'}
              {connectionType && ` (${connectionType})`}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network quality: </span>
            <span className={
              quality === 'excellent' || quality === 'good' 
                ? "text-green-500" 
                : quality === 'fair' 
                  ? "text-yellow-500" 
                  : "text-red-500"
            }>
              {quality}
            </span>
          </div>
          
          {lastAttemptTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last attempt: </span>
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastAttemptTime.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          <div className="pt-1 flex justify-center">
            <Button 
              size="sm"
              variant={retrying ? "outline" : offlineQueue ? "secondary" : "outline"}
              onClick={handleQuickFix}
              disabled={isLoading}
              className="w-full text-xs relative"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : retrying ? (
                <WifiOff className="h-3 w-3 mr-2" />
              ) : offlineQueue ? (
                <Clock className="h-3 w-3 mr-2" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-2" />
              )}
              {offlineQueue 
                ? "Queued - will fix when online"
                : retrying
                  ? "Will retry when online"
                  : "Quick fix status"}
              
              {attemptCount > 0 && !offlineQueue && !retrying && (
                <Badge 
                  variant="secondary" 
                  className="absolute -right-1 -top-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {attemptCount}
                </Badge>
              )}
            </Button>
          </div>
          
          {offlineQueue && isOnline && (
            <div className="text-center text-xs text-muted-foreground animate-pulse">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Back online, processing...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
