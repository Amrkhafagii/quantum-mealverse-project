
import { useState } from "react";
import { DeliveryUser } from "@/types/delivery";

export interface PersonalInfoValues {
  first_name: string;
  last_name: string;
  phone: string;
}

export function usePersonalInfo(initial?: DeliveryUser | null) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues>({
    first_name: initial?.first_name || "",
    last_name: initial?.last_name || "",
    phone: initial?.phone || "",
  });

  function updatePersonalInfo(values: PersonalInfoValues) {
    setPersonalInfo(values);
  }

  return {
    personalInfo,
    updatePersonalInfo,
  };
}
