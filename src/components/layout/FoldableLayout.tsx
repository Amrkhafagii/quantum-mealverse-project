
import React, { useEffect, useState } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';

interface FoldableLayoutProps {
  children: React.ReactNode;
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  className?: string;
}

export const FoldableLayout: React.FC<FoldableLayoutProps> = ({
  children,
  leftPanelContent,
  rightPanelContent,
  className = '',
}) => {
  const { isFoldable, isMobile, isTablet, isLandscape } = useResponsive();
  const [isDeviceFolded, setIsDeviceFolded] = useState(false);
  
  useEffect(() => {
    // In a real implementation, we'd detect the fold state using native APIs
    // For now, we'll just assume it's unfolded for demo purposes
    
    if (isFoldable && Platform.isAndroid()) {
      console.log('Detecting foldable device state...');
      
      // Mock detection logic - in reality, this would use Android's FoldingFeature API
      const detectFoldState = () => {
        // This is just a simulation
        const mockFolded = window.innerWidth < 700 || window.innerHeight < 700;
        setIsDeviceFolded(mockFolded);
      };
      
      detectFoldState();
      window.addEventListener('resize', detectFoldState);
      
      return () => {
        window.removeEventListener('resize', detectFoldState);
      };
    }
  }, [isFoldable]);
  
  // In folded state, show only the primary content
  if (!isFoldable || (isFoldable && isDeviceFolded)) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  // For unfolded state on foldable devices, use a split-screen layout
  return (
    <div className={`flex ${className}`}>
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-800">
        {leftPanelContent}
      </div>
      <div className="w-1/2">
        {rightPanelContent}
      </div>
    </div>
  );
};
