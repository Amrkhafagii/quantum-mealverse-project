
import React from 'react';

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
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      ))}
      
      <div className="flex justify-between pt-2">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Delivery Fee:</span>
        <span>${deliveryFee.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between font-bold text-lg pt-2">
        <span>Total:</span>
        <span className="text-quantum-cyan">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
