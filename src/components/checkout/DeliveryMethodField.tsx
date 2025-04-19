
import React, { useEffect } from 'react';
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
  // Update delivery method effect to ensure proper validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'deliveryMethod') {
        // If method changes to pickup, we don't need location
        if (value.deliveryMethod === 'pickup') {
          form.clearErrors('latitude');
          form.clearErrors('longitude');
        } else if (value.deliveryMethod === 'delivery') {
          // Re-validate location if switching back to delivery
          form.trigger('latitude');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  return (
    <FormField
      control={form.control}
      name="deliveryMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Delivery Method <span className="text-red-500">*</span></FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              // Clear location errors if pickup is selected
              if (value === 'pickup') {
                form.clearErrors('latitude');
                form.clearErrors('longitude');
              } else if (value === 'delivery') {
                // Re-validate location if switching to delivery
                form.trigger('latitude');
              }
            }} 
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
