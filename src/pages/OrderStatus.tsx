
import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderTracker } from '@/components/orders/OrderTracker';
import { useOrderData } from '@/hooks/useOrderData';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { UserSettings } from '@/components/profile/UserSettings';
import { OrderStatusDebug } from '@/components/orders/OrderStatusDebug';
import { MobileStatusDebug } from '@/components/orders/status/MobileStatusDebug';
import { useAuth } from '@/hooks/useAuth';
import { Platform } from '@/utils/platform';

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, refetch } = useOrderData(id || '');
  const { user } = useAuth();
  const isMobile = Platform.isNative();
  
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

  return (
    <div className={`container mx-auto p-4 py-8 ${isMobile ? 'px-2 pb-16' : ''}`}>
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
      ) : (
        <>
          <OrderTracker orderId={id} />
          
          {/* Debug component - only show for admins or in development */}
          {/* Use full debug component on desktop, simplified on mobile */}
          {(isAdmin || process.env.NODE_ENV === 'development') && !isMobile && (
            <OrderStatusDebug orderId={id} onStatusFixed={refetch} />
          )}
          
          {/* Add safe area spacing for mobile */}
          {isMobile && <div className="h-16" />}
        </>
      )}
    </div>
  );
};

export default OrderStatus;
