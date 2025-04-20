
import React from 'react';
import { MapPin, Phone, CreditCard, Clock } from 'lucide-react';

interface OrderDetailsGridProps {
  order: any;
}

export const OrderDetailsGrid: React.FC<OrderDetailsGridProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Delivery Address</h3>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-quantum-cyan mt-0.5" />
          <div>
            <p>{order.customer_name}</p>
            <p>{order.delivery_address}</p>
            <p>{order.city}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Order Info</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-quantum-cyan" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-quantum-cyan" />
            <span>{order.payment_method}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-quantum-cyan" />
            <span>{order.delivery_method}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
