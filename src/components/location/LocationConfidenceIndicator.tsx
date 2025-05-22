
import React from 'react';
import { UnifiedLocation, ConfidenceScore } from '@/types/unifiedLocation';
import { calculateLocationConfidence, getConfidenceCategory, getLocationQualityDescription } from '@/utils/locationConfidenceScoring';
import { Shield, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const category = getConfidenceCategory(confidenceScore);
  
  const getIcon = () => {
    switch (category) {
      case 'high':
        return <ShieldCheck className={cn(
          "text-green-500", 
          size === 'sm' && "h-3.5 w-3.5",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />;
      case 'medium':
        return <Shield className={cn(
          "text-blue-400", 
          size === 'sm' && "h-3.5 w-3.5",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />;
      case 'low':
        return <ShieldAlert className={cn(
          "text-yellow-400", 
          size === 'sm' && "h-3.5 w-3.5",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />;
      case 'very-low':
      case 'unknown':
      default:
        return <ShieldOff className={cn(
          "text-red-400", 
          size === 'sm' && "h-3.5 w-3.5",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />;
    }
  };
  
  const getBadgeColor = () => {
    switch (category) {
      case 'high': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'low': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'very-low': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'unknown':
      default: return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };
  
  if (!showDetails) {
    return (
      <div className="flex items-center" title={`Confidence: ${confidenceScore.overall}%`}>
        {getIcon()}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className={cn(
        "p-2 border rounded-md flex items-center gap-2",
        getBadgeColor()
      )}>
        {getIcon()}
        <div className="text-sm font-medium">
          {getLocationQualityDescription(location)}
        </div>
      </div>
      
      {showDetails && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Overall Score:</span>
            <span className="font-medium">{confidenceScore.overall}%</span>
          </div>
          
          <div className="flex justify-between">
            <span>Source:</span>
            <span className="font-medium">{location.source}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Recency:</span>
            <span className="font-medium">
              {new Date(location.timestamp).toLocaleString()}
            </span>
          </div>
          
          {location.accuracy && (
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className="font-medium">{location.accuracy.toFixed(1)}m</span>
            </div>
          )}
          
          {location.networkInfo?.type && (
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="font-medium">{location.networkInfo.type}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
