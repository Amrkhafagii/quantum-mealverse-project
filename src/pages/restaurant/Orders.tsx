
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import OrderManagement from '@/components/restaurant/orders/OrderManagement';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

const Orders = () => {
  const { restaurant, isLoading, error } = useRestaurantAuth();

  console.log('RestaurantOrders - Component mounted');
  console.log('RestaurantOrders - Restaurant:', restaurant);
  console.log('RestaurantOrders - IsLoading:', isLoading);
  console.log('RestaurantOrders - Error:', error);

  if (isLoading) {
    console.log('RestaurantOrders - Showing loading state');
    return (
      <RestaurantLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
            <p className="text-gray-600">Loading restaurant data...</p>
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  if (error) {
    console.error('RestaurantOrders - Authentication error:', error);
    return (
      <RestaurantLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h3>
            <p className="text-red-600 mb-4">Unable to load restaurant data: {error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  if (!restaurant) {
    console.warn('RestaurantOrders - No restaurant data found');
    return (
      <RestaurantLayout>
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Restaurant Not Found</h3>
            <p className="text-yellow-600">Unable to load restaurant information. Please check your account setup.</p>
          </div>
        </div>
      </RestaurantLayout>
    );
  }

  console.log('RestaurantOrders - Rendering OrderManagement with restaurant ID:', restaurant.id);

  return (
    <RestaurantLayout>
      <ErrorBoundary fallback={
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
            <p className="text-red-600">There was an error loading the order management component.</p>
          </div>
        </div>
      }>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-quantum-cyan">Order Management</h1>
            <div className="text-sm text-gray-500">
              Restaurant: {restaurant.name} (ID: {restaurant.id})
            </div>
          </div>
          <OrderManagement restaurantId={restaurant.id} />
        </div>
      </ErrorBoundary>
    </RestaurantLayout>
  );
};

export default Orders;
