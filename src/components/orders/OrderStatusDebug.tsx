import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { manualFixOrderStatus } from '@/utils/manualOrderFix';
import { supabase } from '@/integrations/supabase/client';
import { useDeliveryStatusSync } from '@/hooks/useDeliveryStatusSync';
import { Loader2, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface OrderStatusDebugProps {
  orderId: string;
  onStatusFixed: () => void;
}

export const OrderStatusDebug: React.FC<OrderStatusDebugProps> = ({ 
  orderId,
  onStatusFixed
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [missingStatuses, setMissingStatuses] = useState<string[]>([]);
  const { isSyncing, lastSyncedAt, sync } = useDeliveryStatusSync(orderId);
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative();
  
  // Fetch the current statuses
  const fetchStatuses = async () => {
    if (!isOnline) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Get current order status
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      
      if (order) {
        setOrderStatus(order.status);
      }
      
      // Get delivery status if exists
      const { data: delivery } = await supabase
        .from('delivery_assignments')
        .select('status')
        .eq('order_id', orderId)
        .in('status', ['assigned', 'picked_up', 'on_the_way', 'delivered'])
        .maybeSingle();
      
      if (delivery) {
        setDeliveryStatus(delivery.status);
      } else {
        setDeliveryStatus(null);
      }
      
      // Get order history
      const { data: history } = await supabase
        .from('order_history')
        .select('status')
        .eq('order_id', orderId);
      
      if (history) {
        setHistoryCount(history.length);
        
        // Check for missing expected statuses
        const statuses = new Set(history.map(h => h.status));
        const expectedStatuses = ['picked_up', 'on_the_way', 'delivered'];
        const missing = expectedStatuses.filter(s => !statuses.has(s));
        setMissingStatuses(missing);
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-fix function
  const handleFix = async () => {
    if (!isOnline) {
      return;
    }
    
    setIsLoading(true);
    try {
      await fixOrderStatus(orderId);
      await fetchStatuses();
      onStatusFixed();
    } catch (error) {
      console.error('Error fixing order status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual fix function
  const handleManualFix = async () => {
    if (!isOnline) {
      return;
    }
    
    setIsLoading(true);
    try {
      await manualFixOrderStatus(orderId);
      await fetchStatuses();
      onStatusFixed();
    } catch (error) {
      console.error('Error manually fixing order:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOnline) {
      fetchStatuses();
    }
  }, [orderId, isOnline]);
  
  const hasStatusMismatch = 
    deliveryStatus && 
    orderStatus && 
    ['picked_up', 'on_the_way', 'delivered'].includes(deliveryStatus) && 
    orderStatus !== deliveryStatus;
    
  const hasIssues = hasStatusMismatch || missingStatuses.length > 0;
  
  return (
    <Card className={`mt-6 bg-slate-900 text-white ${isMobile ? 'rounded-lg shadow-lg mx-0' : ''}`}>
      <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isMobile ? 'px-3 py-2' : ''}`}>
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Order Status Debug
            {hasIssues && <Badge variant="destructive">Issues Detected</Badge>}
          </div>
        </CardTitle>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={fetchStatuses}
          disabled={isLoading || isSyncing || !isOnline}
        >
          {(isLoading || isSyncing) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3 py-2' : ''}>
        {!isOnline ? (
          <div className="text-amber-400 text-xs py-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Debug tools unavailable while offline
          </div>
        ) : (
          <div className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Order Status</p>
                <p className="font-mono">{orderStatus || "None"}</p>
              </div>
              <div>
                <p className="text-gray-400">Delivery Status</p>
                <p className="font-mono">{deliveryStatus || "None"}</p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400">Order History Entries</p>
              <p className="font-mono">{historyCount} entries</p>
              
              {missingStatuses.length > 0 && (
                <div className="mt-1 p-1 bg-red-950 rounded text-red-400">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <p>Missing history entries for: {missingStatuses.join(', ')}</p>
                  </div>
                </div>
              )}
              
              {hasStatusMismatch && (
                <div className="mt-1 p-1 bg-red-950 rounded text-red-400">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <p>Status mismatch: Order status doesn't match delivery status</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleFix}
                disabled={isLoading || isSyncing || !isOnline}
              >
                {isLoading || isSyncing ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Auto-Fix Status
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleManualFix}
                disabled={isLoading || isSyncing || !isOnline}
              >
                Manual Fix
              </Button>
            </div>
            
            {lastSyncedAt && (
              <p className="text-gray-400 text-xs mt-2">
                Last synced: {lastSyncedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
