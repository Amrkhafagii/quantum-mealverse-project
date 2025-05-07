
import React, { lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Truck } from 'lucide-react';

// Lazy load the notification dropdown for better initial load performance
const NotificationDropdown = lazy(() => import('@/components/notifications/NotificationDropdown').then(
  module => ({ default: module.NotificationDropdown })
));

export const UserActions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const userType = user?.user_metadata?.user_type;
  const isDeliveryUser = userType === 'delivery';
  const isRestaurantUser = userType === 'restaurant';
  
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/');
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link to="/auth" state={{ mode: 'signup' }}>
          <Button className="hidden sm:flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Become a Delivery Partner</span>
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-4">
      <Suspense fallback={<div className="w-10 h-10"></div>}>
        <NotificationDropdown />
      </Suspense>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-quantum-cyan text-black">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isDeliveryUser ? (
            <DropdownMenuItem onClick={() => navigate('/delivery/dashboard')}>
              Delivery Dashboard
            </DropdownMenuItem>
          ) : isRestaurantUser ? (
            <DropdownMenuItem onClick={() => navigate('/restaurant/dashboard')}>
              Restaurant Dashboard
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => navigate('/orders')}>
                My Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/fitness')}>
                Fitness
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
