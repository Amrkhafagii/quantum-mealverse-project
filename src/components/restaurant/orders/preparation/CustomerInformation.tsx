
import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import { Order } from '@/types/order';

interface CustomerInformationProps {
  order: Order;
}

export const CustomerInformation: React.FC<CustomerInformationProps> = ({ order }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-500" />
        <span className="font-medium">{order.customer_name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{order.customer_phone}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{order.delivery_address}</span>
      </div>
    </div>
  );
};
