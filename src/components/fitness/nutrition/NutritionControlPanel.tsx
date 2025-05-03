
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Shield } from 'lucide-react';
import WaterIntakeTracker from '@/components/fitness/WaterIntakeTracker';

interface NutritionControlPanelProps {
  isAutoOptimizeProtein: boolean;
  setIsAutoOptimizeProtein: (value: boolean) => void;
  hydrationTarget: number;
  waterIntake?: number;
}

const NutritionControlPanel: React.FC<NutritionControlPanelProps> = ({
  isAutoOptimizeProtein,
  setIsAutoOptimizeProtein,
  hydrationTarget,
  waterIntake = 0
}) => {
  return (
    <div className="space-y-2">
      {/* Water Intake Mini-Display */}
      <WaterIntakeTracker 
        targetIntake={hydrationTarget}
        currentIntake={waterIntake}
      />
      
      {/* Protein Protection Toggle */}
      <div className="flex items-center space-x-2 bg-quantum-darkBlue/40 p-2 rounded-lg">
        <Switch 
          checked={isAutoOptimizeProtein} 
          onCheckedChange={setIsAutoOptimizeProtein}
          className="data-[state=checked]:bg-quantum-purple" 
        />
        <label className="text-xs flex items-center">
          <Shield className="h-3 w-3 mr-1 text-quantum-purple" />
          Protein Protection
        </label>
      </div>
    </div>
  );
};

export default NutritionControlPanel;
