
import React from 'react';
import { TextField, TextareaField } from '@/components/forms/FormField';
import { UseFormReturn } from 'react-hook-form';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';

interface DeliveryDetailsFieldsProps {
  form: UseFormReturn<DeliveryFormValues>;
  defaultEmail?: string;
}

export const DeliveryDetailsFields: React.FC<DeliveryDetailsFieldsProps> = ({ form, defaultEmail }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          required
        />
        
        <TextField
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="Enter your phone number"
          required
        />
      </div>

      {/* Only show email field when there's no defaultEmail */}
      {!defaultEmail && (
        <TextField
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          required
        />
      )}

      <TextField
        name="address"
        label="Delivery Address"
        placeholder="Enter your delivery address"
        required
      />
      
      <TextField
        name="city"
        label="City"
        placeholder="Enter your city"
        required
      />
      
      <TextareaField
        name="notes"
        label="Notes (Optional)"
        placeholder="Any special instructions?"
        rows={2}
      />
    </>
  );
};
