
import React from 'react';
import { Order } from '@/types/order';

interface OrderDetailsDisplayProps {
  order: Order;
}

export const OrderDetailsDisplay: React.FC<OrderDetailsDisplayProps> = ({ order }) => {
  return (
    <div className="space-y-4 border-t border-quantum-cyan/20 pt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Delivery Details</h3>
          <p className="text-sm text-gray-300">{order.customer_name}</p>
          <p className="text-sm text-gray-300">{order.delivery_address}</p>
          <p className="text-sm text-gray-300">{order.city}</p>
          <p className="text-sm text-gray-300">{order.customer_phone}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <p className="text-sm text-gray-300">Subtotal: {order.subtotal.toFixed(2)} EGP</p>
          <p className="text-sm text-gray-300">Delivery: {order.delivery_fee.toFixed(2)} EGP</p>
          <p className="text-sm font-semibold text-quantum-cyan">Total: {order.total.toFixed(2)} EGP</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Delivery Method</h3>
        <p className="text-sm text-gray-300 capitalize">{order.delivery_method}</p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-gray-300 capitalize">{order.payment_method}</p>
      </div>

      {order.notes && (
        <div>
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-gray-300">{order.notes}</p>
        </div>
      )}
    </div>
  );
};
