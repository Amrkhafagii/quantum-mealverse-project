
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
    console.log("%c === SUBMIT ATTEMPT DETECTED ===", "background: #FF5733; color: white; padding: 4px; font-weight: bold;");
    console.log("Form submission attempt with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form dirty:", form.formState.isDirty);
    console.log("Form touched fields:", form.formState.touchedFields);
    console.log("isSubmitting state:", isSubmitting);
    console.log("Form values dump:", form.getValues());
    
    if (data.deliveryMethod === "delivery" && data.latitude === 0 && data.longitude === 0) {
      console.warn("⚠️ Location required but not provided");
      toast({
        title: "Location Required",
        description: "Please select your delivery location on the map",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("✅ Proceeding with form submission");
      await onSubmit(data);
    } catch (error) {
      console.error("❌ Error in form submission:", error);
    }
  };

  React.useEffect(() => {
    console.log("DeliveryForm mounted with defaultValues:", defaultValues);
    console.log("Current isSubmitting state:", isSubmitting);
    
    return () => {
      console.log("DeliveryForm unmounted");
    };
  }, [defaultValues, isSubmitting]);

  // Manual event listener logger for the submit button
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    const button = buttonRef.current;
    
    if (button) {
      console.log("Submit button found in DOM, attaching listeners");
      
      const clickHandler = (e: Event) => {
        console.log("%c 🖱️ BUTTON CLICKED", "background: #4CAF50; color: white; padding: 4px; font-weight: bold;");
        console.log("Button event:", e);
        console.log("Button disabled:", button.disabled);
        console.log("Form state at click time:", {
          isValid: form.formState.isValid,
          errors: form.formState.errors,
          isSubmitting: isSubmitting
        });
      };
      
      button.addEventListener('click', clickHandler);
      
      return () => {
        button.removeEventListener('click', clickHandler);
      };
    } else {
      console.warn("Button ref not found");
    }
  }, [form.formState, isSubmitting]);

  return (
    <Card className="holographic-card p-6">
      <h2 className="text-xl font-bold text-quantum-cyan mb-6">Delivery Information</h2>
      
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            console.log("%c 📝 FORM SUBMIT EVENT", "background: #2196F3; color: white; padding: 4px; font-weight: bold;");
            console.log("Form event:", e);
            form.handleSubmit(handleSubmitWithValidation)(e);
          }} 
          className="space-y-6"
        >
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
            ref={buttonRef}
            type="submit" 
            className="cyber-button w-full py-6 text-lg"
            disabled={false} // Never disable the button
            onClick={(e) => {
              console.log("%c 🔴 DIRECT BUTTON ONCLICK", "background: #9C27B0; color: white; padding: 4px; font-weight: bold;");
              console.log("Button click event:", e);
              console.log("Form validation status:", form.formState);
            }}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
