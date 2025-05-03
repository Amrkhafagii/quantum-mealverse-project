
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { supabase } from '@/integrations/supabase/client';

interface OrderStatusDebugProps {
  orderId: string;
  onStatusFixed: () => void;
}

export const OrderStatusDebug: React.FC<OrderStatusDebugProps> = ({ orderId, onStatusFixed }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const handleFixStatus = async () => {
    setIsFixing(true);
    try {
      const success = await fixOrderStatus(orderId);
      if (success) {
        onStatusFixed();
      }
    } finally {
      setIsFixing(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      const { data: assignments, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('*')
        .eq('order_id', orderId);
        
      const { data: history, error: historyError } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
        
      setDebugInfo({
        order,
        orderError,
        assignments,
        assignmentError,
        history,
        historyError
      });
      
      setShowDebugInfo(true);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  return (
    <Card className="mt-4 bg-yellow-900/10 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-sm">Order Status Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleFixStatus}
            disabled={isFixing}
          >
            {isFixing ? 'Fixing...' : 'Fix Status Sync Issue'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDebugInfo}
          >
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>
        
        {showDebugInfo && debugInfo && (
          <div className="bg-black/80 p-4 rounded text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
            <pre className="text-green-400">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
