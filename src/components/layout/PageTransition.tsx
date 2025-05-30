
import React from 'react';
import { useLocation } from 'react-router-dom';
import ScreenTransition, { TransitionType } from './ScreenTransition';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  identifier?: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'platform',
  identifier,
  className = 'w-full h-full',
}) => {
  const location = useLocation();
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const getDefaultTransition = (): TransitionType => {
    if (isPlatformIOS) return 'slide';
    if (isPlatformAndroid) return 'fade';
    return 'fade';
  };
  
  const transitionType = type === 'platform' ? getDefaultTransition() : type;
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
