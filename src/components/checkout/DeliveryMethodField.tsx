
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
import { DeliveryFormValues } from './DeliveryForm';

interface DeliveryMethodFieldProps {
  form: UseFormReturn<DeliveryFormValues>;
}

export const DeliveryMethodField: React.FC<DeliveryMethodFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="deliveryMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Delivery Method <span className="text-red-500">*</span></FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery method" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="delivery">Home Delivery (+50 EGP)</SelectItem>
              <SelectItem value="pickup">Pickup (Free)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
