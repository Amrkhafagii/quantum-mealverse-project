
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface WaterIntakeTrackerProps {
  targetIntake: number;
  currentIntake?: number;
}

const GLASS_SIZE = 250; // ml per glass
const RECOMMENDED_DAILY = 2500; // ml for average adult

const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({
  targetIntake = RECOMMENDED_DAILY,
  currentIntake: initialIntake = 0
}) => {
  const { toast } = useToast();
  const [currentIntake, setCurrentIntake] = useState(initialIntake);
  
  // Load saved water intake from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedIntake = localStorage.getItem(`water_intake_${today}`);
    
    if (savedIntake) {
      setCurrentIntake(parseInt(savedIntake));
    }
  }, []);
  
  // Save water intake to localStorage whenever it changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`water_intake_${today}`, currentIntake.toString());
  }, [currentIntake]);
  
  const percentage = Math.min(100, Math.round((currentIntake / targetIntake) * 100));
  
  const handleAddWater = (amount: number) => {
    const newIntake = Math.max(0, currentIntake + amount);
    setCurrentIntake(newIntake);
    
    if (amount > 0 && newIntake >= targetIntake && currentIntake < targetIntake) {
      toast({
        title: "Daily Goal Reached!",
        description: "You've hit your water intake goal for today. Great job!",
      });
    }
  };

  const glassesCount = Math.floor(currentIntake / GLASS_SIZE);
  const remainingGlasses = Math.ceil((targetIntake - currentIntake) / GLASS_SIZE);
  
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
          
          <Progress value={percentage} className="h-1.5 bg-blue-900/60" />
          
          <div className="flex justify-between items-center mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(-GLASS_SIZE)}
              className="h-7 w-7 p-0 rounded-full border-blue-500/30 text-blue-400"
              disabled={currentIntake <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <div className="text-center">
              <span className="text-xs text-gray-400">{glassesCount} glasses</span>
              <span className="text-sm font-medium block">{percentage}%</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddWater(GLASS_SIZE)}
              className="h-7 w-7 p-0 rounded-full border-blue-500/30 text-blue-400"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {remainingGlasses > 0 && (
            <div className="text-xs text-center text-gray-400 mt-1">
              {remainingGlasses} more {remainingGlasses === 1 ? 'glass' : 'glasses'} to go
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterIntakeTracker;
