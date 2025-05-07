
import React, { useRef, useEffect, useState } from 'react';
import { useTouchEnhanced } from '@/contexts/TouchOptimizerContext';

interface TouchEnabledMapProps {
  children: React.ReactNode;
  className?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const TouchEnabledMap: React.FC<TouchEnabledMapProps> = ({
  children,
  className = '',
  onZoomIn,
  onZoomOut
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);
  
  // Use touch gestures
  useTouchEnhanced({
    onPinchIn: () => {
      if (onZoomOut) {
        onZoomOut();
        setShowHint(false);
      }
    },
    onPinchOut: () => {
      if (onZoomIn) {
        onZoomIn();
        setShowHint(false);
      }
    },
    onDoubleTap: () => {
      if (onZoomIn) {
        onZoomIn();
        setShowHint(false);
      }
    }
  });
  
  // Auto hide the hints after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={mapContainerRef}>
      {children}
      
      {showHint && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white rounded-lg p-3 z-10 text-sm">
          <div className="flex items-center mb-2">
            <span className="text-xs pinch-hint">👌</span>
            <span className="ml-2">Pinch to zoom</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs">👆👆</span>
            <span className="ml-2">Double tap to zoom in</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouchEnabledMap;
