
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Navigation, MapPin, Info } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme'; // Assuming you have this hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AccuracyLevel = 'high' | 'medium' | 'low' | 'unknown';

interface LocationAccuracyIndicatorProps {
  accuracy: AccuracyLevel;
  accuracyValue?: number; // Accuracy in meters if available
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'icon' | 'full';
  onRecoveryRequest?: () => void; // Optional callback to request better accuracy
}

export function LocationAccuracyIndicator({
  accuracy = 'unknown',
  accuracyValue,
  showLabel = true,
  size = 'medium',
  variant = 'full',
  onRecoveryRequest
}: LocationAccuracyIndicatorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Icon and color configurations
  const configs = {
    high: {
      icon: Navigation,
      color: isDark ? 'text-green-400' : 'text-green-600',
      bgColor: isDark ? 'bg-green-400/10' : 'bg-green-50',
      borderColor: isDark ? 'border-green-400/20' : 'border-green-100',
      label: 'High Accuracy'
    },
    medium: {
      icon: MapPin,
      color: isDark ? 'text-amber-400' : 'text-amber-600',
      bgColor: isDark ? 'bg-amber-400/10' : 'bg-amber-50',
      borderColor: isDark ? 'border-amber-400/20' : 'border-amber-100',
      label: 'Medium Accuracy'
    },
    low: {
      icon: AlertCircle,
      color: isDark ? 'text-red-400' : 'text-red-500',
      bgColor: isDark ? 'bg-red-400/10' : 'bg-red-50',
      borderColor: isDark ? 'border-red-400/20' : 'border-red-100',
      label: 'Low Accuracy'
    },
    unknown: {
      icon: Info,
      color: isDark ? 'text-gray-400' : 'text-gray-500',
      bgColor: isDark ? 'bg-gray-400/10' : 'bg-gray-50',
      borderColor: isDark ? 'border-gray-400/20' : 'border-gray-100',
      label: 'Unknown Accuracy'
    }
  };
  
  const config = configs[accuracy];
  const IconComponent = config.icon;
  
  // Size configurations
  const sizeClasses = {
    small: {
      icon: 'h-3 w-3',
      text: 'text-xs',
      padding: 'py-0.5 px-1.5',
      gap: 'gap-1'
    },
    medium: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      padding: 'py-1 px-2',
      gap: 'gap-1.5'
    },
    large: {
      icon: 'h-5 w-5',
      text: 'text-base',
      padding: 'py-1.5 px-2.5',
      gap: 'gap-2'
    }
  };
  
  const sizeClass = sizeClasses[size];
  
  // Get the description for tooltip
  const getDescription = () => {
    if (accuracy === 'high') {
      return 'Your location is precise within a few meters';
    } else if (accuracy === 'medium') {
      return 'Your location is approximate within a city block';
    } else if (accuracy === 'low') {
      return 'Your location is approximate within a neighborhood';
    }
    return 'Your location accuracy cannot be determined';
  };
  
  // Format accuracy for display
  const formatAccuracy = (meters?: number) => {
    if (!meters) return '';
    return meters < 1000 ? `±${Math.round(meters)}m` : `±${(meters / 1000).toFixed(1)}km`;
  };
  
  // Render just the icon with tooltip
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`${config.color} cursor-help`}>
              <IconComponent className={sizeClass.icon} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-sm">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{getDescription()}</p>
              {accuracyValue && (
                <p className="text-xs mt-1">{formatAccuracy(accuracyValue)}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Render as badge
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline"
              className={`${config.bgColor} ${config.borderColor} ${config.color} ${sizeClass.padding} cursor-help`}
            >
              <div className={`flex items-center ${sizeClass.gap}`}>
                <IconComponent className={sizeClass.icon} />
                {showLabel && <span className={sizeClass.text}>{config.label}</span>}
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-sm">
              <p>{getDescription()}</p>
              {accuracyValue && (
                <p className="text-xs mt-1">{formatAccuracy(accuracyValue)}</p>
              )}
              {accuracy !== 'high' && (
                <p className="text-xs mt-1 italic">Your experience may be affected by reduced location precision</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Full variant (default)
  return (
    <div className={`flex flex-col ${accuracy !== 'high' ? 'space-y-2' : ''}`}>
      <div className={`flex items-center ${sizeClass.gap}`}>
        <IconComponent className={`${sizeClass.icon} ${config.color}`} />
        <span className={`${sizeClass.text} font-medium`}>
          {config.label} {accuracyValue && `(${formatAccuracy(accuracyValue)})`}
        </span>
      </div>
      
      {accuracy !== 'high' && (
        <div className="text-sm text-muted-foreground">
          <p>{getDescription()}</p>
          {onRecoveryRequest && (
            <button 
              onClick={onRecoveryRequest}
              className="text-xs mt-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Try to improve accuracy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
