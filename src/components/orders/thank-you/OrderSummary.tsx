
import React from 'react';
import { Order } from '@/types/order';

interface OrderSummaryProps {
  order: Order | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-800">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Delivery Details</h3>
        <div className="space-y-2 text-gray-300">
          <p>{order.delivery_address}</p>
          <p>{order.city}</p>
          <p>{order.customer_phone}</p>
        </div>
        
        <div className="pt-4">
          <h3 className="text-xl font-semibold mb-2">Delivery Method</h3>
          <p className="text-gray-300">{order.delivery_method}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal:</span>
            <span>{order.subtotal.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Delivery:</span>
            <span>{order.delivery_fee.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between text-xl font-semibold text-quantum-cyan pt-2">
            <span>Total:</span>
            <span>{order.total.toFixed(2)} EGP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
