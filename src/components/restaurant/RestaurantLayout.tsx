
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, ClipboardList, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface RestaurantLayoutProps {
  children: ReactNode;
}

export const RestaurantLayout = ({ children }: RestaurantLayoutProps) => {
  const { restaurant, logout } = useRestaurantAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your restaurant account",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-quantum-darkBlue/80 min-h-screen p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-quantum-cyan">Restaurant Portal</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {restaurant && (
            <div className="mb-6">
              <p className="text-sm text-gray-400">Managing</p>
              <p className="font-medium truncate">{restaurant.name}</p>
            </div>
          )}
          
          <Separator className="my-4 bg-quantum-cyan/20" />
          
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left"
              onClick={() => navigate('/restaurant/dashboard')}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left"
              onClick={() => navigate('/restaurant/menu')}
            >
              <Menu className="mr-2 h-5 w-5" />
              Menu Management
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left"
              onClick={() => navigate('/restaurant/orders')}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              Orders
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left"
              onClick={() => navigate('/profile')}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </nav>
          
          <div className="absolute bottom-8 left-4 right-4 md:w-56">
            <Button 
              variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-950/30 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
