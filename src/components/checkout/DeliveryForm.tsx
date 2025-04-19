
import React, { useState } from 'react';
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

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    if (location?.latitude && location?.longitude) {
      if (location.latitude === 0 && location.longitude === 0) return;
      
      form.setValue('latitude', location.latitude, { shouldValidate: true, shouldDirty: true });
      form.setValue('longitude', location.longitude, { shouldValidate: true, shouldDirty: true });
      form.trigger(['latitude', 'longitude']);
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

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
            disabled={isSubmitting || !form.formState.isValid}
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
