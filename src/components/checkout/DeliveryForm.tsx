
import React, { useState, useEffect, useCallback } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocationSection } from './LocationSection';
import { DeliveryMethodField } from './DeliveryMethodField';
import { PaymentMethodField } from './PaymentMethodField';
import { DeliveryDetailsFields } from './DeliveryDetailsFields';
import { ReadOnlyDeliveryDetails } from './ReadOnlyDeliveryDetails';
import { Edit2 } from 'lucide-react';
import { useDeliveryForm, type DeliveryFormValues } from '@/hooks/useDeliveryForm';

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormValues) => void;
  defaultValues?: Partial<DeliveryFormValues>;
  isSubmitting?: boolean;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ 
  onSubmit, 
  defaultValues,
  isSubmitting = false 
}) => {
  const [isEditing, setIsEditing] = useState(!defaultValues?.fullName);
  const { form, handleSubmit } = useDeliveryForm({ onSubmit, defaultValues, isSubmitting });

  // Memoize the location update handler to prevent unnecessary rerenders
  const handleLocationUpdate = useCallback((location: { latitude: number; longitude: number }) => {
    if (location?.latitude && location?.longitude) {
      if (location.latitude === 0 && location.longitude === 0) return;
      
      form.setValue('latitude', location.latitude, { shouldValidate: true, shouldDirty: true });
      form.setValue('longitude', location.longitude, { shouldValidate: true, shouldDirty: true });
      form.trigger(['latitude', 'longitude']);
    }
  }, [form]);

  // Improved toggle function to prevent freezing - memoized with useCallback
  const toggleEdit = useCallback(() => {
    setIsEditing(prev => {
      // When canceling edit, reset form values to defaultValues
      if (prev && defaultValues) {
        // Schedule the form reset on the next tick to avoid React state update issues
        setTimeout(() => {
          if (defaultValues) {
            // Batch all form updates together
            const updates: Record<string, any> = {};
            
            Object.entries(defaultValues).forEach(([key, value]) => {
              if (value !== undefined) {
                updates[key as keyof DeliveryFormValues] = value;
              }
            });
            
            // Update form in a single batch
            form.reset(updates as DeliveryFormValues);
          }
        }, 0);
      }
      return !prev;
    });
  }, [defaultValues, form]);

  // Check if the form is valid based on delivery method
  const isDeliveryMethodPickup = form.watch('deliveryMethod') === 'pickup';
  const formIsValid = isDeliveryMethodPickup || form.formState.isValid;

  return (
    <Card className="holographic-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-quantum-cyan">Delivery Information</h2>
        {defaultValues?.fullName && (
          <Button
            type="button"
            variant="ghost"
            onClick={toggleEdit}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {isEditing ? "Cancel Editing" : "Edit Details"}
          </Button>
        )}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" id="delivery-form">
          <LocationSection 
            onLocationUpdate={handleLocationUpdate}
            required={form.watch('deliveryMethod') === 'delivery'}
          />
          
          {isEditing ? (
            <DeliveryDetailsFields form={form} defaultEmail={defaultValues?.email} />
          ) : (
            <ReadOnlyDeliveryDetails defaultValues={defaultValues} />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeliveryMethodField form={form} />
            <PaymentMethodField form={form} />
          </div>
          
          <Button 
            type="submit" 
            className="cyber-button w-full py-6 text-lg"
            disabled={isSubmitting || (!formIsValid && !isDeliveryMethodPickup)}
            id="place-order-button"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

// Export the type to make it explicit
export type { DeliveryFormValues };
