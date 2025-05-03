
import React from 'react';
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
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Truck } from 'lucide-react';

export const UserActions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const userType = user?.user_metadata?.user_type;
  const isDeliveryUser = userType === 'delivery';
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
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
      <NotificationDropdown />
      
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
          ) : (
            <DropdownMenuItem onClick={() => navigate('/orders')}>
              My Orders
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            Profile
          </DropdownMenuItem>
          
          {!isDeliveryUser && (
            <DropdownMenuItem onClick={() => navigate('/fitness')}>
              Fitness
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
