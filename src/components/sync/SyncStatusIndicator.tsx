
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CloudOff, Check, RefreshCw } from "lucide-react";
import { useSyncManager } from '@/services/sync/syncManager';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
}

export function SyncStatusIndicator({ 
  className = '', 
  showLabel = false,
  showCount = true
}: SyncStatusIndicatorProps) {
  const { toast } = useToast();
  const { isOnline } = useConnectionStatus();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { manualSync, getPendingActionsCount } = useSyncManager();
  const [pendingCount, setPendingCount] = React.useState(0);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  // Get pending actions count periodically
  React.useEffect(() => {
    const checkPendingActions = async () => {
      const count = await getPendingActionsCount();
      setPendingCount(count);
    };
    
    checkPendingActions();
    const interval = setInterval(checkPendingActions, 5000);
    
    return () => clearInterval(interval);
  }, [getPendingActionsCount]);

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Connect to the internet to sync your data",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const success = await manualSync();
      if (success) {
        setLastSyncTime(new Date());
        
        // Refresh the pending count after sync
        const count = await getPendingActionsCount();
        setPendingCount(count);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showCount && pendingCount > 0 && (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {pendingCount} pending
        </Badge>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost" 
              disabled={isSyncing} 
              onClick={handleSync} 
              className={pendingCount > 0 ? "text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400" : ""}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !isOnline ? (
                <CloudOff className="h-4 w-4" />
              ) : pendingCount > 0 ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {showLabel && (
                <span className="ml-2">
                  {isSyncing ? "Syncing..." : 
                   !isOnline ? "Offline" :
                   pendingCount > 0 ? "Sync now" : "Synced"}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSyncing ? "Syncing data..." : 
             !isOnline ? "You're offline. Connect to sync data." :
             pendingCount > 0 ? `Sync ${pendingCount} pending changes` : 
             lastSyncTime ? `Last synced: ${lastSyncTime.toLocaleTimeString()}` : "All data synced"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
