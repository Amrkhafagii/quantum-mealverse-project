
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  ChefHat,
  DollarSign
} from 'lucide-react';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ children }) => {
  const { restaurant, logout } = useRestaurantAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/restaurant/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/restaurant/orders', icon: Package },
    { name: 'Menu', href: '/restaurant/menu', icon: ChefHat },
    { name: 'Financials', href: '/restaurant/financials', icon: DollarSign },
    { name: 'Settings', href: '/restaurant/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b">
            <h1 className="text-xl font-bold text-quantum-cyan">Restaurant Portal</h1>
          </div>

          {/* Restaurant Info */}
          {restaurant && (
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{restaurant.name}</h2>
              <p className="text-sm text-gray-600">{restaurant.email}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-quantum-cyan text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={logout}
              className="w-full flex items-center justify-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6 px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
