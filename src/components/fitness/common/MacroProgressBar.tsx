
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MacroProgressBarProps {
  title: string;
  currentValue: number;
  targetValue: number;
  colorClass: string;
  bgColorClass: string;
  icon?: React.ReactNode;
  isCritical?: boolean;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  title,
  currentValue,
  targetValue,
  colorClass,
  bgColorClass,
  icon,
  isCritical = false,
}) => {
  const percentage = Math.round((currentValue / targetValue) * 100);
  const isTargetMet = percentage >= 95;
  const isLow = percentage < 90;
  const formattedPercentage = `${percentage}%`;
  
  return (
    <div className={cn("p-4 rounded-lg", bgColorClass)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("text-sm font-medium flex items-center gap-2", colorClass)}>
          {icon}
          {title}
          {isTargetMet && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Shield className="h-4 w-4 text-green-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Target met! ({formattedPercentage})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="text-sm font-medium">
          {currentValue}g <span className="text-gray-500 text-xs">/ {targetValue}g</span>
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            "h-2 bg-gray-700",
            isTargetMet ? "[&>div]:bg-green-500" : 
            isLow && isCritical ? "[&>div]:bg-red-500" : 
            `[&>div]:${colorClass.replace("text-", "bg-")}`
          )}
        />
      </div>
      
      {isCritical && isLow && (
        <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>Critical nutrient below target</span>
        </div>
      )}
      
      {isTargetMet && (
        <div className="flex items-center gap-1 mt-1.5 text-green-400 text-xs animate-fade-in">
          <span>Target successfully met! 🎉</span>
        </div>
      )}
    </div>
  );
};

export default MacroProgressBar;
