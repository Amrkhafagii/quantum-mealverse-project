
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Utensils, 
  ActivitySquare, 
  Salad, 
  Package, 
  User, 
  CalendarCheck,
  ShoppingCart,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

export const CustomerNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cart } = useCart();
  
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navigationItems = [
    {
      path: '/customer',
      label: 'Order Food',
      icon: Utensils,
      description: 'Browse restaurants and order meals'
    },
    {
      path: '/fitness',
      label: 'Fitness',
      icon: ActivitySquare,
      description: 'Track workouts and fitness goals'
    },
    {
      path: '/nutrition',
      label: 'Nutrition',
      icon: Salad,
      description: 'Plan meals and track nutrition'
    },
    {
      path: '/subscription',
      label: 'Meal Plans',
      icon: CalendarCheck,
      description: 'Subscribe to meal plans'
    }
  ];
  
  const userActions = [
    {
      path: '/orders',
      label: 'My Orders',
      icon: Package,
      description: 'Track your order history',
      requiresAuth: true,
      badge: null
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      description: 'View your cart items',
      requiresAuth: false,
      badge: cart.length > 0 ? cart.length : null
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your account',
      requiresAuth: true,
      badge: null
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Main Navigation */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-quantum-cyan" />
            Explore Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-start gap-2 ${
                  isActive(item.path)
                    ? "bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                    : "border-quantum-cyan/30 text-white hover:bg-quantum-cyan/10 hover:border-quantum-cyan/50"
                }`}
              >
                <Link to={item.path}>
                  <div className="flex items-center gap-2 w-full">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="text-xs opacity-80 text-left mt-1">
                    {item.description}
                  </p>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* User Actions */}
      <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {userActions.map((action) => {
              if (action.requiresAuth && !user) return null;
              
              return (
                <Button
                  key={action.path}
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10 relative"
                >
                  <Link to={action.path} className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                    {action.badge && (
                      <span className="absolute -top-2 -right-2 bg-quantum-cyan text-quantum-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {action.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
