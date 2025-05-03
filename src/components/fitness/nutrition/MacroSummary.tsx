
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

interface MacroSummaryProps {
  totalCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  actualProtein: number;
  actualCarbs: number;
  actualFat: number;
}

const MacroSummary: React.FC<MacroSummaryProps> = ({
  totalCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  actualProtein,
  actualCarbs,
  actualFat,
}) => {
  // Calculate the percentages for the progress bars
  const proteinPercentage = Math.round((actualProtein || 0) / targetProtein * 100);
  const carbsPercentage = Math.round((actualCarbs || 0) / targetCarbs * 100);
  const fatPercentage = Math.round((actualFat || 0) / targetFat * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Calories Display - Larger and more prominent */}
            <div className="col-span-3 bg-quantum-darkBlue/50 rounded-lg p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-400">Daily Calories</div>
              <div className="text-2xl md:text-3xl font-bold text-quantum-cyan">
                {totalCalories} kcal
              </div>
            </div>
            
            {/* Macro Progress Indicators - More compact and color-coded */}
            <div className="col-span-6 grid grid-cols-3 gap-2">
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-400 text-xs font-medium">Protein</span>
                  <span className="text-xs">{proteinPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-right">{actualProtein || 0}/{targetProtein}g</div>
              </div>
              
              <div className="bg-green-900/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-green-400 text-xs font-medium">Carbs</span>
                  <span className="text-xs">{carbsPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-green-900/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-right">{actualCarbs || 0}/{targetCarbs}g</div>
              </div>
              
              <div className="bg-yellow-900/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-400 text-xs font-medium">Fats</span>
                  <span className="text-xs">{fatPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-yellow-900/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-right">{actualFat || 0}/{targetFat}g</div>
              </div>
            </div>
            
            {/* This is where the NutritionControlPanel will go */}
            <div className="col-span-3">
              {/* Placeholder for the NutritionControlPanel */}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MacroSummary;
