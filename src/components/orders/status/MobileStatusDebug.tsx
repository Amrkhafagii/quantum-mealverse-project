
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Bug } from 'lucide-react';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
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
  const { isOnline } = useConnectionStatus();
  
  // Quick fix function
  const handleQuickFix = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Can't fix order status while offline",
        variant: "destructive"
      });
      hapticFeedback.error();
      return;
    }
    
    setIsLoading(true);
    hapticFeedback.medium();
    
    try {
      await fixOrderStatus(orderId);
      toast({
        title: "Status fixed",
        description: "Order status has been synchronized",
        variant: "default"
      });
      hapticFeedback.success();
      onStatusFixed();
    } catch (error) {
      console.error('Error fixing order status:', error);
      toast({
        title: "Fix failed",
        description: "Could not fix order status",
        variant: "destructive"
      });
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
            </span>
          </div>
          
          <div className="pt-1 flex justify-center">
            <Button 
              size="sm"
              variant="outline"
              onClick={handleQuickFix}
              disabled={isLoading || !isOnline}
              className="w-full text-xs"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-2" />
              )}
              Quick fix status
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
