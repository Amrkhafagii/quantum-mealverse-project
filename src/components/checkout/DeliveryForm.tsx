
import React, { useState } from 'react';
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
import { Edit2 } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(!defaultValues?.fullName);
  
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

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
        <form 
          onSubmit={(e) => {
            console.log("Form submit event:", e);
            form.handleSubmit(onSubmit)(e);
          }} 
          className="space-y-6"
        >
          <LocationSection 
            onLocationUpdate={handleLocationUpdate}
            required={form.watch('deliveryMethod') === 'delivery'}
          />
          
          {isEditing ? (
            <DeliveryDetailsFields form={form} defaultEmail={defaultValues?.email} />
          ) : (
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
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeliveryMethodField form={form} />
            <PaymentMethodField form={form} />
          </div>
          
          <Button 
            type="submit" 
            className="cyber-button w-full py-6 text-lg"
            disabled={isSubmitting} 
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

