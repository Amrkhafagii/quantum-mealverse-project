
import React from 'react';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';

export const OrderSummary = ({ order }: { order: any }) => {
  if (!order) return null;
  
  const items = order.order_items || [];
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <span className="font-medium">{item.name}</span>
              <p className="text-sm text-muted-foreground">x{item.quantity}</p>
            </div>
            <CurrencyDisplay amount={item.price * item.quantity} className="font-medium" />
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <CurrencyDisplay amount={order.subtotal} />
        </div>
        <div className="flex justify-between mb-2">
          <span>Delivery Fee</span>
          <CurrencyDisplay amount={order.delivery_fee} />
        </div>
        <div className="flex justify-between font-bold mt-2 text-lg">
          <span>Total</span>
          <CurrencyDisplay amount={order.total} className="text-quantum-cyan" />
        </div>
      </div>
    </div>
  );
};
