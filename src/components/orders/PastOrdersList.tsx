
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';

interface PastOrdersListProps {
  orders: any[];
}

export const PastOrdersList: React.FC<PastOrdersListProps> = ({ orders }) => {
  const navigate = useNavigate();
  
  if (!orders.length) return null;
  
  return (
    <>
      <h2 className="text-2xl font-bold text-quantum-cyan mt-8">Past Orders</h2>
      {orders.map((order) => (
        <Card key={order.id} className="hover:border-quantum-cyan/50 transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Order #{order.id.substring(0, 8)}
              </CardTitle>
              <OrderStatusBadge status={order.status} />
            </div>
            <CardDescription>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span>${order.total.toFixed(2)}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-center mt-4">
        <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')}>
          View All Orders
        </Button>
      </div>
    </>
  );
};
