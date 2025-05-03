
import React from 'react';
import { Button } from "@/components/ui/button";
import { Droplets } from 'lucide-react';
import { toast } from 'sonner';

const SavePlanButton: React.FC = () => {
  return (
    <div className="flex justify-center mt-6">
      <Button
        className="bg-quantum-purple hover:bg-quantum-purple/90 px-8"
        onClick={() => {
          toast({
            title: "Meal Plan Saved",
            description: "Your personalized meal plan has been saved to your profile.",
          });
        }}
      >
        <Droplets className="h-4 w-4 mr-2" />
        Save This Meal Plan
      </Button>
    </div>
  );
};

export default SavePlanButton;
