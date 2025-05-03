
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WaterIntakeTrackerProps {
  targetIntake: number;
  currentIntake: number;
}

const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  targetIntake,
  currentIntake: initialIntake
}) => {
  const [currentIntake, setCurrentIntake] = useState(initialIntake);
  
  const percentage = Math.min(100, Math.round((currentIntake / targetIntake) * 100));
  
  const handleAddWater = (amount: number) => {
    setCurrentIntake(prev => Math.min(targetIntake, Math.max(0, prev + amount)));
  };
  
  return (
    <div className="relative">
      <Card className="bg-quantum-darkBlue/50 border-blue-500/20 overflow-hidden">
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-medium text-blue-400">Water Intake</h4>
            </div>
            <div className="text-xs text-gray-400">
              {currentIntake} / {targetIntake} ml
            </div>
          </div>
          
          <Progress value={percentage} className="h-1.5 bg-blue-900/60" indicatorClassName="bg-blue-500" />
          
          <div className="flex justify-between items-center mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(-250)}
              className="h-7 w-7 p-0 rounded-full border-blue-500/30 text-blue-400"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="text-center">
              <span className="text-sm font-medium">{percentage}%</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(250)}
              className="h-7 w-7 p-0 rounded-full border-blue-500/30 text-blue-400"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterIntakeTracker;
