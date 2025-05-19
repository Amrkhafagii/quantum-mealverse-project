
import React, { useEffect, useState, useCallback } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { AlertCircle, Loader2, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ConnectionRecoveryManagerProps {
  children?: React.ReactNode;
  showRecoveryDialog?: boolean;
  criticalDataSources?: string[];
}

export function ConnectionRecoveryManager({
  children,
  showRecoveryDialog = true,
  criticalDataSources = []
}: ConnectionRecoveryManagerProps) {
  const { isOnline, wasOffline, connectionType } = useConnectionStatus();
  const { quality, checkQuality } = useNetworkQuality();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [recoveryCompleted, setRecoveryCompleted] = useState(false);
  
  const recoverConnection = useCallback(async () => {
    if (!isOnline) return;
    
    setIsRecovering(true);
    setRecoveryProgress(0);
    
    try {
      // Try to recheck network quality
      await checkQuality();
      
      // Simulate recovery steps with progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setRecoveryProgress(i);
      }
      
      // Run any data recovery or revalidation logic here
      if (criticalDataSources && criticalDataSources.length > 0) {
        // Example: refetch critical data
        // await Promise.all(criticalDataSources.map(source => refetchData(source)));
      }
      
      setRecoveryCompleted(true);
      
      toast({
        title: "Connection recovered",
        description: "Your connection has been restored successfully.",
      });
      
      setTimeout(() => {
        setShowDialog(false);
        setIsRecovering(false);
      }, 1000);
    } catch (error) {
      console.error('Recovery failed:', error);
      
      toast({
        title: "Recovery failed",
        description: "We couldn't fully restore your connection. Some data may be unavailable.",
        variant: "destructive"
      });
      
      setIsRecovering(false);
    }
  }, [isOnline, checkQuality, criticalDataSources]);
  
  // Handle connection changes
  useEffect(() => {
    if (isOnline && wasOffline) {
      // Connection was restored after being offline
      if (showRecoveryDialog) {
        setShowDialog(true);
        setRecoveryCompleted(false);
      } else {
        // Auto-recover without dialog
        recoverConnection();
      }
    }
  }, [isOnline, wasOffline, showRecoveryDialog, recoverConnection]);
  
  return (
    <>
      {children}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connection Restored</DialogTitle>
            <DialogDescription>
              Your internet connection was lost and has now been restored. 
              We need to refresh your data to ensure everything is up to date.
            </DialogDescription>
          </DialogHeader>
          
          {!recoveryCompleted ? (
            <>
              <div className="py-4">
                {isRecovering ? (
                  <div className="space-y-4">
                    <Progress value={recoveryProgress} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      Recovering data... {recoveryProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    {isOnline ? (
                      <AlertCircle className="h-10 w-10 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-10 w-10 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {isOnline ? (
                  <Button 
                    onClick={recoverConnection} 
                    disabled={isRecovering}
                    className="w-full"
                  >
                    {isRecovering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recovering...
                      </>
                    ) : 'Recover Data'}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full">
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <Check className="h-10 w-10 text-green-500 mb-4" />
              <p className="text-center">All data synchronized successfully!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConnectionRecoveryManager;
