
import { useState } from "react";
import { DeliveryVehicle } from "@/types/delivery";

export interface VehicleInfoValues {
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
}

export function useVehicleInfo(initial?: DeliveryVehicle | null) {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfoValues>({
    type: initial?.vehicle_type || "",
    make: initial?.make || "",
    model: initial?.model || "",
    year: initial?.year || new Date().getFullYear(),
    color: initial?.color || "",
    license_plate: initial?.license_plate || "",
  });

  function updateVehicleInfo(values: VehicleInfoValues) {
    setVehicleInfo(values);
  }

  return {
    vehicleInfo,
    updateVehicleInfo,
  };
}
