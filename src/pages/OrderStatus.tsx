
import React from 'react';
import { useParams } from 'react-router-dom';
import OrderTracker from '@/components/orders/OrderTracker';
import { useOrderData } from '@/hooks/useOrderData';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { UserSettings } from '@/components/profile/UserSettings';
import { OrderStatusDebug } from '@/components/orders/OrderStatusDebug';
import { MobileStatusDebug } from '@/components/orders/status/MobileStatusDebug';
import { NetworkStateIndicator } from '@/components/orders/status/NetworkStateIndicator';
import { useAuth } from '@/hooks/useAuth';
import { Platform } from '@/utils/platform';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { toast } from '@/components/ui/use-toast';

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, refetch, error } = useOrderData(id || '');
  const { user } = useAuth();
  const isMobile = Platform.isNative();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Determine if the user is an admin for debug purposes
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data } = await fetch('/api/check-admin-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        }).then(res => res.json());
        
        setIsAdmin(data?.isAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        // For demonstration, set a debug flag based on username
        setIsAdmin(user.email === 'admin@example.com');
      }
    };
    
    checkAdmin();
  }, [user]);

  const handleRefresh = async () => {
    console.log('Refreshing order data...');
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Order information updated",
      });
    } catch (refreshError) {
      console.error('Error refreshing:', refreshError);
      toast({
        title: "Refresh failed",
        description: "Couldn't update order information",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Display network state indicator at top of screen
  React.useEffect(() => {
    // Only add this effect for mobile devices
    if (!isMobile) return;
    
    // Add safe area padding for the network indicator
    document.body.style.paddingTop = 'env(safe-area-inset-top, 20px)';
    
    return () => {
      document.body.style.paddingTop = '';
    };
  }, [isMobile]);

  const content = (
    <div className={`container mx-auto p-4 py-8 ${isMobile ? 'px-2 pb-16' : ''}`}>
      {isMobile && <NetworkStateIndicator variant="slim" position="top" />}
      
      <div className={`flex justify-between items-center mb-6 ${isMobile ? 'px-2' : ''}`}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className={`font-bold text-quantum-cyan ${isMobile ? 'text-xl' : 'text-2xl'}`}>Order Status</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBadge variant="small" />
          <UserSettings />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : !id ? (
        <div className="text-center p-12">
          <p className="text-muted-foreground">No order ID provided</p>
          <Button asChild className="mt-4">
            <Link to="/orders">View Your Orders</Link>
          </Button>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 rounded-lg border border-red-200 text-center">
          <p className="text-red-600 mb-4">There was a problem loading your order information</p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <OrderTracker orderId={id} />
          
          {/* Debug component - only show for admins or in development */}
          {/* Use full debug component on desktop, simplified on mobile */}
          {(isAdmin || process.env.NODE_ENV === 'development') && !isMobile && (
            <OrderStatusDebug orderId={id} onStatusFixed={refetch} />
          )}
          
          {/* Use mobile debug component on mobile */}
          {(isAdmin || process.env.NODE_ENV === 'development') && isMobile && (
            <MobileStatusDebug orderId={id} onStatusFixed={refetch} />
          )}
          
          {/* Add safe area spacing for mobile */}
          {isMobile && <div className="h-16" />}
        </>
      )}
    </div>
  );

  // Wrap with pull-to-refresh only on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      {content}
    </PullToRefresh>
  ) : content;
};

export default OrderStatus;
