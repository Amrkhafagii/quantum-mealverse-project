
import React from 'react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';

interface OrderItemsListProps {
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({ 
  items, 
  subtotal, 
  deliveryFee, 
  total 
}) => {
  return (
    <div className="space-y-2">
      {items && items.map((item: any) => (
        <div key={item.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
          <div>
            <span className="font-medium">{item.name}</span>
            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
          </div>
          <div className="text-quantum-cyan font-medium">
            <CurrencyDisplay amount={item.price * item.quantity} />
          </div>
        </div>
      ))}
      
      <div className="flex justify-between pt-2">
        <span>Subtotal:</span>
        <CurrencyDisplay amount={subtotal} />
      </div>
      
      <div className="flex justify-between">
        <span>Delivery Fee:</span>
        <CurrencyDisplay amount={deliveryFee} />
      </div>
      
      <div className="flex justify-between font-bold text-lg pt-2">
        <span>Total:</span>
        <CurrencyDisplay amount={total} className="text-quantum-cyan" />
      </div>
    </div>
  );
};
