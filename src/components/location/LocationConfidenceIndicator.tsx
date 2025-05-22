
import React from 'react';
import { calculateLocationConfidence, ConfidenceCategory } from '@/utils/locationConfidenceScoring';
import { UnifiedLocation } from '@/types/unifiedLocation';
import { AlertCircle, CheckCircle, Info, AlertTriangle, SignalMedium } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Function to get confidence category from score
function getConfidenceCategory(score: { overall: number }): ConfidenceCategory {
  if (score.overall >= 75) {
    return 'high';
  } else if (score.overall >= 50) {
    return 'medium';
  } else if (score.overall >= 25) {
    return 'low';
  } else if (score.overall > 0) {
    return 'very-low';
  } else {
    return 'unknown';
  }
}

// Function to get location quality description
function getLocationQualityDescription(location: UnifiedLocation): string {
  const score = calculateLocationConfidence(location);
  const category = getConfidenceCategory(score);
  
  switch (category) {
    case 'high':
      return `High quality location from ${location.source} source with ${location.accuracy}m accuracy.`;
    case 'medium':
      return `Decent location accuracy from ${location.source} source.`;
    case 'low':
      return `Limited location reliability from ${location.source} source.`;
    case 'very-low':
      return `Poor location accuracy. Consider refreshing or using a different source.`;
    case 'unknown':
    default:
      return 'Unable to determine location quality.';
  }
}

interface LocationConfidenceIndicatorProps {
  location: UnifiedLocation;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LocationConfidenceIndicator({ 
  location, 
  showDetails = false,
  size = 'md' 
}: LocationConfidenceIndicatorProps) {
  const confidenceScore = calculateLocationConfidence(location);
  const confidenceCategory = getConfidenceCategory(confidenceScore);
  const qualityDescription = getLocationQualityDescription(location);
  
  // Icon and color based on confidence category
  const getIconAndColor = () => {
    switch (confidenceCategory) {
      case 'high':
        return { 
          icon: <CheckCircle className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />, 
          color: 'bg-green-100 text-green-800 hover:bg-green-200',
          label: 'High'
        };
      case 'medium':
        return { 
          icon: <SignalMedium className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />, 
          color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          label: 'Medium'
        };
      case 'low':
        return { 
          icon: <AlertTriangle className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />, 
          color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
          label: 'Low'
        };
      case 'very-low':
        return { 
          icon: <AlertCircle className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />, 
          color: 'bg-red-100 text-red-800 hover:bg-red-200',
          label: 'Poor'
        };
      default:
        return { 
          icon: <Info className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />, 
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          label: 'Unknown'
        };
    }
  };

  const { icon, color, label } = getIconAndColor();

  // Simple badge with tooltip if not showing details
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${color} flex items-center gap-1`}>
              {icon}
              <span>{label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{qualityDescription}</p>
            <p className="text-xs mt-1">Score: {confidenceScore.overall}/100</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed view
  return (
    <div className="border rounded-md p-3 bg-background">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium flex items-center gap-2">
          {icon}
          Location Confidence
        </h4>
        <Badge variant="outline" className={color}>
          {confidenceScore.overall}%
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">{qualityDescription}</p>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Source</span>
          <span className="font-medium">{location.source}</span>
        </div>
        {location.accuracy !== undefined && (
          <div className="flex justify-between">
            <span>Accuracy</span>
            <span className="font-medium">{location.accuracy}m</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Network</span>
          <span className="font-medium">{location.networkInfo?.type || 'unknown'}</span>
        </div>
      </div>
    </div>
  );
}
