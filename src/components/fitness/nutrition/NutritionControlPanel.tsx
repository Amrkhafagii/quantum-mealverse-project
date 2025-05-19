
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Shield } from 'lucide-react';
import WaterIntakeTracker from '@/components/fitness/WaterIntakeTracker';

interface NutritionControlPanelProps {
  isAutoOptimizeProtein: boolean;
  setIsAutoOptimizeProtein: (value: boolean) => void;
  hydrationTarget: number;
  waterIntake?: number;
  onWaterIntakeChange?: (newIntake: number) => void;
}

const NutritionControlPanel: React.FC<NutritionControlPanelProps> = ({
  isAutoOptimizeProtein,
  setIsAutoOptimizeProtein,
  hydrationTarget,
  waterIntake = 0,
  onWaterIntakeChange
}) => {
  // Today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  // Try to load water intake from localStorage if not provided by props
  const [localWaterIntake, setLocalWaterIntake] = useState<number>(waterIntake);
  
  useEffect(() => {
    if (waterIntake === 0) {
      const savedIntake = localStorage.getItem(`water_intake_${today}`);
      if (savedIntake) {
        setLocalWaterIntake(parseInt(savedIntake));
      }
    } else {
      setLocalWaterIntake(waterIntake);
    }
  }, [waterIntake, today]);
  
  const handleWaterIntakeChange = (newIntake: number) => {
    setLocalWaterIntake(newIntake);
    if (onWaterIntakeChange) {
      onWaterIntakeChange(newIntake);
    }
  };

  return (
    <div className="space-y-2">
      {/* Water Intake Mini-Display */}
      <WaterIntakeTracker 
        targetIntake={hydrationTarget}
        currentIntake={localWaterIntake}
        onIntakeChange={handleWaterIntakeChange}
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
