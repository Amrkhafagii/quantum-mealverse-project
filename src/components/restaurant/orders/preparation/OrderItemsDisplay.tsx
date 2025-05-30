
import React from 'react';
import { StickyNote } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderItemsDisplayProps {
  order: Order;
}

export const OrderItemsDisplay: React.FC<OrderItemsDisplayProps> = ({ order }) => {
  return (
    <div>
      <h4 className="font-medium mb-2">Order Items</h4>
      <div className="space-y-1">
        {order.order_items?.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span>${item.price?.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center space-x-1 text-yellow-700">
            <StickyNote className="h-3 w-3" />
            <span className="text-xs font-medium">Special Instructions:</span>
          </div>
          <p className="text-sm text-yellow-800 mt-1">{order.notes}</p>
        </div>
      )}
    </div>
  );
};
