
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from 'react-hook-form';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';

interface PaymentMethodFieldProps {
  form: UseFormReturn<DeliveryFormValues>;
}

export const PaymentMethodField: React.FC<PaymentMethodFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payment Method <span className="text-red-500">*</span></FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="cash">Cash on Delivery</SelectItem>
              <SelectItem value="visa">Credit/Debit Card</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
