
import React from 'react';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';

interface ReadOnlyDeliveryDetailsProps {
  defaultValues: Partial<DeliveryFormValues>;
}

export const ReadOnlyDeliveryDetails: React.FC<ReadOnlyDeliveryDetailsProps> = ({ defaultValues }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <p className="text-gray-300">{defaultValues?.fullName}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <p className="text-gray-300">{defaultValues?.phone}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <p className="text-gray-300">{defaultValues?.email}</p>
      </div>
      <div>
        <label className="text-sm font-medium">Address</label>
        <p className="text-gray-300">{defaultValues?.address}</p>
      </div>
      <div>
        <label className="text-sm font-medium">City</label>
        <p className="text-gray-300">{defaultValues?.city}</p>
      </div>
    </div>
  );
};
