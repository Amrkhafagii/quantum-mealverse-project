
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useRestaurantAnalytics } from '@/hooks/restaurant/useRestaurantAnalytics';
import { useRestaurantInventory, useLowStockItems } from '@/hooks/restaurant/useRestaurantInventory';
import { useRestaurantMenuItems, usePopularMenuItems } from '@/hooks/restaurant/useRestaurantMenuItems';
import { Loader2, AlertTriangle, TrendingUp } from 'lucide-react';

export const RestaurantDataExample: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  
  const { data: analytics, loading: analyticsLoading } = useRestaurantAnalytics(restaurant?.id || '');
  const { data: inventory, loading: inventoryLoading } = useRestaurantInventory(restaurant?.id || '');
  const { data: lowStockItems, loading: lowStockLoading } = useLowStockItems(restaurant?.id || '');
  const { data: menuItems, loading: menuLoading } = useRestaurantMenuItems(restaurant?.id || '');
  const { data: popularItems, loading: popularLoading } = usePopularMenuItems(restaurant?.id || '', 5);

  if (!restaurant) {
    return <div>Please log in to view restaurant data</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              <p>Total Records: {analytics.length}</p>
              {analytics.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm">
                  {item.date}: {item.total_orders} orders, ${item.total_revenue}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : lowStockItems.length > 0 ? (
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="text-sm text-orange-600">
                  {item.name}: {item.current_stock} {item.unit} (min: {item.minimum_stock})
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-sm">All items well stocked!</p>
          )}
        </CardContent>
      </Card>

      {/* Popular Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          {popularLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {popularItems.map((item) => (
                <div key={item.id} className="text-sm">
                  {item.name} - ${item.price}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
