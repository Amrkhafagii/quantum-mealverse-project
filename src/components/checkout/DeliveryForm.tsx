
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocationSection } from './LocationSection';
import { DeliveryMethodField } from './DeliveryMethodField';
import { PaymentMethodField } from './PaymentMethodField';
import { DeliveryDetailsFields } from './DeliveryDetailsFields';
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(11, { message: "Please enter a valid phone number" }),
  address: z.string().min(10, { message: "Address must be at least 10 characters" }),
  city: z.string().min(2, { message: "Please enter a valid city" }),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["cash", "visa"]),
  latitude: z.number(),
  longitude: z.number(),
}).refine((data) => {
  if (data.deliveryMethod === "delivery") {
    return data.latitude !== 0 && data.longitude !== 0;
  }
  return true;
}, {
  message: "Location is required for delivery",
  path: ["latitude"],
});

export type DeliveryFormValues = z.infer<typeof formSchema>;

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      deliveryMethod: "delivery",
      paymentMethod: "cash",
      latitude: 0,
      longitude: 0,
      ...defaultValues
    },
    mode: "onChange"
  });

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    console.log("Location updated:", location);
    form.setValue('latitude', location.latitude);
    form.setValue('longitude', location.longitude);
    form.trigger('latitude');
  };

  const handleSubmitWithValidation = async (data: DeliveryFormValues) => {
    console.log("Form submission attempt with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("isSubmitting state:", isSubmitting);
    
    if (data.deliveryMethod === "delivery" && data.latitude === 0 && data.longitude === 0) {
      console.log("Location required but not provided");
      toast({
        title: "Location Required",
        description: "Please select your delivery location on the map",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Proceeding with form submission");
    await onSubmit(data);
  };

  return (
    <Card className="holographic-card p-6">
      <h2 className="text-xl font-bold text-quantum-cyan mb-6">Delivery Information</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitWithValidation)} className="space-y-6">
          <LocationSection 
            onLocationUpdate={handleLocationUpdate}
            required={form.watch('deliveryMethod') === 'delivery'}
          />
          
          <DeliveryDetailsFields form={form} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeliveryMethodField form={form} />
            <PaymentMethodField form={form} />
          </div>
          
          <Button 
            type="submit" 
            className="cyber-button w-full py-6 text-lg"
            disabled={false} // Never disable the button
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
