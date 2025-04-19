
import React, { useCallback } from 'react';
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

interface DeliveryMethodFieldProps {
  form: UseFormReturn<DeliveryFormValues>;
}

export const DeliveryMethodField: React.FC<DeliveryMethodFieldProps> = ({ form }) => {
  // Memoize the onChange handler to prevent unnecessary rerenders
  const handleDeliveryMethodChange = useCallback((value: string) => {
    form.setValue('deliveryMethod', value as "delivery" | "pickup", { shouldValidate: true });
    
    // Clear location errors if pickup is selected
    if (value === 'pickup') {
      form.clearErrors('latitude');
      form.clearErrors('longitude');
    } else if (value === 'delivery') {
      // Re-validate location if switching to delivery
      setTimeout(() => {
        form.trigger('latitude');
      }, 0);
    }
  }, [form]);
  
  return (
    <FormField
      control={form.control}
      name="deliveryMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Delivery Method <span className="text-red-500">*</span></FormLabel>
          <Select 
            onValueChange={handleDeliveryMethodChange} 
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
