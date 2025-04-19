
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Package, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';

interface ActiveOrdersListProps {
  orders: any[];
  selectedOrderId: string | null;
  onOrderSelect: (orderId: string) => void;
}

export const ActiveOrdersList: React.FC<ActiveOrdersListProps> = ({ 
  orders, 
  selectedOrderId, 
  onOrderSelect 
}) => {
  const navigate = useNavigate();
  
  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You don't have any active orders at the moment.</p>
          <Button onClick={() => navigate('/customer')}>Order Meals</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <h2 className="text-2xl font-bold text-quantum-cyan">Active Orders</h2>
      {orders.map((order) => (
        <Card 
          key={order.id}
          className={`cursor-pointer transition-all hover:border-quantum-cyan ${
            selectedOrderId === order.id ? 'border-quantum-cyan border-2' : ''
          }`}
          onClick={() => onOrderSelect(order.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Order #{order.id.substring(0, 8)}
              </CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
            <CardDescription>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-quantum-cyan" />
                <span>{order.order_items.length} items</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-quantum-cyan" />
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order.id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
