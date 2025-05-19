
import React from 'react';
import { useLocation } from 'react-router-dom';
import ScreenTransition, { TransitionType } from './ScreenTransition';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
}

/**
 * Wrapper component for page transitions using location pathname as the key
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'platform',
}) => {
  const location = useLocation();
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  // Determine default transition type by platform if not specified
  const getDefaultTransition = (): TransitionType => {
    if (isPlatformIOS) return 'slide';
    if (isPlatformAndroid) return 'fade';
    return 'fade';
  };
  
  const transitionType = type === 'platform' ? getDefaultTransition() : type;
  
  return (
    <ScreenTransition 
      identifier={location.pathname} 
      type={transitionType}
      className="w-full h-full"
    >
      {children}
    </ScreenTransition>
  );
};

export default PageTransition;
