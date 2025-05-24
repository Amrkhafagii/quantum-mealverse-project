
import React from 'react';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, ChefHat } from 'lucide-react';
import { MealType } from '@/types/meal';

interface CustomerMealGridProps {
  menuItems: MealType[];
  isLoading: boolean;
  error?: Error | null;
  onLocationRequest: () => void;
}

export const CustomerMealGrid: React.FC<CustomerMealGridProps> = ({
  menuItems,
  isLoading,
  error,
  onLocationRequest
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-quantum-darkBlue/30 rounded-lg overflow-hidden">
            <Skeleton className="h-48 bg-quantum-darkBlue/50" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 bg-quantum-darkBlue/70 mb-3" />
              <Skeleton className="h-4 w-1/2 bg-quantum-darkBlue/70 mb-2" />
              <Skeleton className="h-4 w-5/6 bg-quantum-darkBlue/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <p className="text-xl mb-2">Error Loading Menu Items</p>
          <p className="text-gray-400">{error.message}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-quantum-purple hover:bg-quantum-purple/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
          <h3 className="text-2xl font-semibold mb-2 text-white">No Menu Items Available</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            We found restaurants near you, but they don't have any menu items available for delivery right now.
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-quantum-cyan/20 text-quantum-cyan hover:bg-quantum-cyan/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((meal) => (
        <CustomerMealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
};
