
import React from 'react';
import { Card } from "@/components/ui/card";
import { useCart, CartItem } from '@/contexts/CartContext';

export const OrderSummary = () => {
  const { items, totalAmount } = useCart();
  const deliveryFee = 50; // This could be made dynamic later if needed
  const finalTotal = totalAmount + deliveryFee;

  return (
    <Card className="holographic-card p-6 sticky top-24">
      <h2 className="text-xl font-bold text-quantum-cyan mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {items.map((item: CartItem) => (
          <div key={item.id} className="flex gap-2 border-b border-quantum-cyan/20 pb-2">
            <div className="w-16 h-16">
              <img 
                src={item.image_url || `https://picsum.photos/seed/${item.id}/300/200`} 
                alt={item.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold">{item.name}</h3>
                <span>{item.quantity} x {(item.price * 50).toFixed(2)} EGP</span>
              </div>
              <p className="text-sm text-gray-400">
                {item.calories} kcal
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2 border-t border-quantum-cyan/20 pt-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{totalAmount.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>{deliveryFee.toFixed(2)} EGP</span>
        </div>
        <div className="border-t border-quantum-cyan/20 pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-quantum-cyan">{finalTotal.toFixed(2)} EGP</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
