
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(11, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "Please enter a valid city" }),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["cash", "visa"]),
  latitude: z.number(),
  longitude: z.number(),
}).refine((data) => {
  // Only require location validation if delivery method is 'delivery'
  if (data.deliveryMethod === "pickup") {
    return true;
  }
  return data.latitude !== 0 && data.longitude !== 0;
}, {
  message: "Location is required for delivery",
  path: ["latitude"],
});

export type DeliveryFormValues = z.infer<typeof formSchema>;

interface UseDeliveryFormProps {
  onSubmit: (data: DeliveryFormValues) => void;
  defaultValues?: Partial<DeliveryFormValues>;
  isSubmitting?: boolean;
}

export const useDeliveryForm = ({ onSubmit, defaultValues, isSubmitting }: UseDeliveryFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      deliveryMethod: "delivery" as const,
      paymentMethod: "cash" as const,
      latitude: defaultValues?.latitude || 0,
      longitude: defaultValues?.longitude || 0,
      ...defaultValues
    },
    mode: "onTouched"  // Changed from onChange to improve performance
  });

  const handleSubmit = (data: DeliveryFormValues) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    handleSubmit,
    isSubmitting
  };
};
