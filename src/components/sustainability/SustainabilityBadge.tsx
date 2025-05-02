
import React from 'react';
import { Leaf, Droplet, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SustainabilityMetric = {
  type: 'carbon' | 'water' | 'local' | 'organic';
  value: number; // Score from 0-100
  label: string;
};

interface SustainabilityBadgeProps {
  metric: SustainabilityMetric;
  size?: 'sm' | 'md' | 'lg';
}

const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({ 
  metric,
  size = 'md'
}) => {
  const getIcon = () => {
    switch (metric.type) {
      case 'carbon':
        return <TrendingDown className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} />;
      case 'water':
        return <Droplet className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} />;
      case 'local':
      case 'organic':
      default:
        return <Leaf className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} />;
    }
  };

  const getColor = () => {
    if (metric.value >= 80) return 'bg-green-500/20 text-green-400';
    if (metric.value >= 60) return 'bg-emerald-500/20 text-emerald-400';
    if (metric.value >= 40) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'py-0.5 px-1.5 text-xs';
      case 'lg': return 'py-1 px-3 text-sm';
      default: return 'py-0.5 px-2 text-xs';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className={`rounded-full ${getColor()} ${getSizeClasses()} flex items-center gap-1`}>
            {getIcon()}
            <span>{metric.type === 'carbon' ? `${metric.value}%` : metric.type === 'water' ? `${metric.value}%` : metric.type}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-quantum-darkBlue/90 border-quantum-cyan/30 backdrop-blur-sm text-white p-3">
          <p className="font-semibold">{metric.label}</p>
          <p className="text-sm text-gray-300">
            {metric.type === 'carbon' && `This meal's carbon footprint is ${metric.value}% lower than average.`}
            {metric.type === 'water' && `This meal's water footprint is ${metric.value}% lower than average.`}
            {metric.type === 'local' && `This meal uses locally sourced ingredients.`}
            {metric.type === 'organic' && `This meal uses organic ingredients.`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SustainabilityBadge;
