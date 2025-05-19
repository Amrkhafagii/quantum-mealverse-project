
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { ConnectionStateIndicator } from '@/components/ui/ConnectionStateIndicator';
import { UserSettings } from '@/components/profile/UserSettings';

interface OrdersHeaderProps {
  pendingActionsCount: number;
  handleSync: () => Promise<void>;
  isSyncing: boolean;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({ 
  pendingActionsCount, 
  handleSync, 
  isSyncing 
}) => {
  const { isOnline } = useConnectionStatus();
  
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold text-quantum-cyan neon-text">Track Your Orders</h1>
          <ConnectionStateIndicator showText={true} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 text-quantum-cyan hover:bg-quantum-cyan/20"
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
            {pendingActionsCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingActionsCount}
              </Badge>
            )}
          </Button>
          <UserSettings />
        </div>
      </div>
      
      {!isOnline && (
        <div className="bg-amber-900/20 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-md mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
            <p>You are currently offline. Limited functionality available.</p>
          </div>
          {pendingActionsCount > 0 && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-200">
              {pendingActionsCount} pending {pendingActionsCount === 1 ? 'action' : 'actions'}
            </Badge>
          )}
        </div>
      )}
    </>
  );
};

// Make sure to include this import at the top
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
