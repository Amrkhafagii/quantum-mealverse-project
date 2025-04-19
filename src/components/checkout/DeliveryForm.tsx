
import React, { useState, useEffect } from 'react';
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
  latitude: z.number().refine(val => val !== 0, { message: "Location is required" }),
  longitude: z.number().refine(val => val !== 0, { message: "Location is required" }),
}).refine((data) => {
  // Simplify the refinement to improve validation success
  if (data.deliveryMethod === "pickup") {
    return true; // No location needed for pickup
  }
  return data.latitude !== 0 && data.longitude !== 0;
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
  
  // Type the defaultValues correctly and ensure all enum values are properly cast
  const typedDefaultValues = defaultValues || {};
  
  console.log("[Place Order Debug] Default values received:", typedDefaultValues);
  
  // Initialize form with default values and ensure location values are set
  const initialValues: Partial<DeliveryFormValues> = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    deliveryMethod: "delivery" as const,
    paymentMethod: "cash" as const,
    latitude: typedDefaultValues.latitude || 0,
    longitude: typedDefaultValues.longitude || 0,
    ...typedDefaultValues
  };
  
  // Log the default values being used
  console.log("[Place Order Debug] Initial form values:", initialValues);
  
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: "onChange"
  });

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      console.log("[Place Order Debug] Updating form with new default values:", defaultValues);
      
      // Explicitly set each field to ensure the form updates properly
      if (defaultValues.fullName) form.setValue('fullName', defaultValues.fullName);
      if (defaultValues.email) form.setValue('email', defaultValues.email);
      if (defaultValues.phone) form.setValue('phone', defaultValues.phone);
      if (defaultValues.address) form.setValue('address', defaultValues.address);
      if (defaultValues.city) form.setValue('city', defaultValues.city);
      if (defaultValues.notes) form.setValue('notes', defaultValues.notes);
      if (defaultValues.deliveryMethod) form.setValue('deliveryMethod', defaultValues.deliveryMethod);
      if (defaultValues.paymentMethod) form.setValue('paymentMethod', defaultValues.paymentMethod);
      
      // Always update coordinates if provided
      if (defaultValues.latitude && defaultValues.latitude !== 0) {
        console.log("[Place Order Debug] Setting latitude from defaultValues:", defaultValues.latitude);
        form.setValue('latitude', defaultValues.latitude, { shouldValidate: true });
      }
      
      if (defaultValues.longitude && defaultValues.longitude !== 0) {
        console.log("[Place Order Debug] Setting longitude from defaultValues:", defaultValues.longitude);
        form.setValue('longitude', defaultValues.longitude, { shouldValidate: true });
      }
      
      // Validate the form after updating values
      form.trigger();
    }
  }, [defaultValues, form]);

  // Add form state debugging
  useEffect(() => {
    console.log("[Place Order Debug] DeliveryForm mounted");
    
    // Log current form state on mount
    console.log("[Place Order Debug] Form validation on mount:", {
      defaultValues: form.formState.defaultValues,
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors,
    });
    
    // Return cleanup function to log when form is unmounted
    return () => {
      console.log("[Place Order Debug] DeliveryForm unmounted");
    };
  }, []);

  // Debug form validation state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(`[Place Order Debug] Form field "${name}" changed, type: ${type}`);
      const formState = form.formState;
      console.log("[Place Order Debug] Form validation:", {
        isValid: formState.isValid,
        isDirty: formState.isDirty,
        errors: Object.keys(formState.errors).length > 0 ? formState.errors : "No errors",
        values: value
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    console.log("[Place Order Debug] Location updated:", location);
    
    if (location && location.latitude && location.longitude) {
      // Make sure we're setting real coordinates, not zeros
      if (location.latitude === 0 && location.longitude === 0) {
        console.warn("[Place Order Debug] Received zero coordinates, not updating form");
        return;
      }
      
      form.setValue('latitude', location.latitude, { shouldValidate: true, shouldDirty: true });
      form.setValue('longitude', location.longitude, { shouldValidate: true, shouldDirty: true });
      form.trigger(['latitude', 'longitude']);
      
      console.log("[Place Order Debug] Form coordinates updated:", {
        latitude: form.getValues('latitude'),
        longitude: form.getValues('longitude')
      });
    } else {
      console.warn("[Place Order Debug] Received invalid location:", location);
    }
  };

  const toggleEdit = () => {
    console.log("[Place Order Debug] Toggle edit mode:", !isEditing);
    setIsEditing(!isEditing);
  };

  // Force validate form when delivery method changes
  useEffect(() => {
    const deliveryMethodSubscription = form.watch((value, { name }) => {
      if (name === 'deliveryMethod') {
        // If changed to pickup, ensure we validate since location may not be required
        if (value.deliveryMethod === 'pickup') {
          form.trigger();
        }
      }
    });
    
    return () => deliveryMethodSubscription.unsubscribe();
  }, [form]);

  // Updated submission handler
  const handleFormSubmit = (data: DeliveryFormValues) => {
    console.log("[Place Order Debug] Form submission triggered with data:", data);
    
    try {
      console.log("[Place Order Debug] Calling onSubmit prop...");
      onSubmit(data);
      console.log("[Place Order Debug] onSubmit prop called successfully");
    } catch (error) {
      console.error("[Place Order Debug] Error during form submission:", error);
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your order. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Log when button is rendered and its disabled state
  useEffect(() => {
    console.log("[Place Order Debug] Button disabled state:", isSubmitting);
    console.log("[Place Order Debug] Form is valid:", form.formState.isValid);
    
    // Log detailed form errors to help debugging
    if (!form.formState.isValid) {
      console.log("[Place Order Debug] Form errors:", form.formState.errors);
    }
  }, [isSubmitting, form.formState.isValid, form.formState.errors]);

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
            console.log("[Place Order Debug] Form onSubmit event fired", {
              defaultPrevented: e.defaultPrevented,
              eventPhase: e.eventPhase,
              currentTarget: e.currentTarget,
              target: e.target
            });
            form.handleSubmit(handleFormSubmit)(e);
          }} 
          className="space-y-6"
          id="delivery-form"
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
            disabled={isSubmitting || !form.formState.isValid}
            onClick={(e) => {
              console.log("[Place Order Debug] Button clicked", {
                disabled: isSubmitting || !form.formState.isValid,
                defaultPrevented: e.defaultPrevented,
                buttonElement: e.currentTarget,
                formIsValid: form.formState.isValid,
                formErrors: form.formState.errors
              });
            }}
            id="place-order-button"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
