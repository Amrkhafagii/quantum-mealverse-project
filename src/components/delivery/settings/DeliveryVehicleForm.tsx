
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DeliveryVehicle } from "@/types/delivery";
import { getVehicleByDeliveryUserId, saveVehicleInfo } from "@/services/delivery/deliveryService";

const formSchema = z.object({
  type: z.enum(["bicycle", "car", "motorcycle", "scooter", "on_foot"]),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  license_plate: z.string().optional(),
});

interface DeliveryVehicleFormProps {
  deliveryUserId: string;
}

const DeliveryVehicleForm: React.FC<DeliveryVehicleFormProps> = ({
  deliveryUserId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicle, setVehicle] = useState<DeliveryVehicle | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "on_foot",
      make: "",
      model: "",
      year: "",
      color: "",
      license_plate: "",
    },
  });

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setIsLoading(true);
        const vehicleData = await getVehicleByDeliveryUserId(deliveryUserId);
        if (vehicleData) {
          setVehicle(vehicleData);
          form.reset({
            type: vehicleData.type,
            make: vehicleData.make || "",
            model: vehicleData.model || "",
            year: vehicleData.year ? String(vehicleData.year) : "",
            color: vehicleData.color || "",
            license_plate: vehicleData.license_plate || "",
          });
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        toast.error("Failed to load vehicle information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [deliveryUserId]);

  // Watch vehicle type to conditionally display fields
  const vehicleType = form.watch("type");
  const needsVehicleDetails = vehicleType !== "on_foot" && vehicleType !== "bicycle";
  const needsLicensePlate = vehicleType === "car" || vehicleType === "motorcycle";

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert year to number if provided
      const vehicleData = {
        ...values,
        delivery_user_id: deliveryUserId,
        year: values.year ? parseInt(values.year) : undefined,
      };
      
      await saveVehicleInfo(vehicleData);
      toast.success("Vehicle information updated successfully");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle information");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading vehicle information...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="on_foot">On Foot</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsVehicleDetails && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota, Honda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Corolla, Civic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Red, Blue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {needsLicensePlate && (
          <FormField
            control={form.control}
            name="license_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="License plate number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Vehicle Information"}
        </Button>
      </form>
    </Form>
  );
};

export default DeliveryVehicleForm;
