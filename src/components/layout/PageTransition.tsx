
import React from 'react';
import { useLocation } from 'react-router-dom';
import ScreenTransition, { TransitionType } from './ScreenTransition';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  identifier?: string; // Add this line to accept the identifier prop
  className?: string; // Add this to accept the className prop
}

/**
 * Wrapper component for page transitions using location pathname as the key
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'platform',
  identifier, // Accept the identifier prop
  className = 'w-full h-full', // Accept className with default value
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
  
  // Use the provided identifier or fall back to location.pathname
  const transitionIdentifier = identifier || location.pathname;
  
  return (
    <ScreenTransition 
      identifier={transitionIdentifier}
      type={transitionType}
      className={className}
    >
      {children}
    </ScreenTransition>
  );
};

export default PageTransition;
