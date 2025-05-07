
import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Lazy load non-critical components
const RestaurantAnalytics = lazy(() => import('./analytics/RestaurantAnalytics'));
const OrderManagement = lazy(() => import('./orders/OrderManagement'));

export const RestaurantDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
      
      {/* Order Management Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Order Management</h2>
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </Card>
        }>
          <OrderManagement />
        </Suspense>
      </section>
      
      {/* Analytics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        <Suspense fallback={
          <Card className="p-6">
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </Card>
        }>
          <RestaurantAnalytics />
        </Suspense>
      </section>
    </div>
  );
};

export default RestaurantDashboard;
