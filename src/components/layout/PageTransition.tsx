
import React from 'react';
import { useLocation } from 'react-router-dom';
import ScreenTransition, { TransitionType } from './ScreenTransition';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  identifier?: string;
  className?: string;
  // Enhanced responsive props
  mobileType?: TransitionType;
  tabletType?: TransitionType;
  desktopType?: TransitionType;
  duration?: number;
  respectReducedMotion?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'platform',
  identifier,
  className = 'w-full h-full',
  mobileType,
  tabletType,
  desktopType,
  duration,
  respectReducedMotion = true,
}) => {
  const location = useLocation();
  const { 
    isPlatformIOS, 
    isPlatformAndroid, 
    isMobile, 
    isTablet, 
    isDesktop,
    isLandscape,
    isFoldable 
  } = useResponsive();
  
  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const getOptimalTransition = (): TransitionType => {
    // Respect reduced motion preference
    if (prefersReducedMotion) {
      return 'fade';
    }
    
    // Use device-specific transitions if provided
    if (isMobile && mobileType) return mobileType;
    if (isTablet && tabletType) return tabletType;
    if (isDesktop && desktopType) return desktopType;
    
    // Use provided type if not 'platform'
    if (type !== 'platform') return type;
    
    // Enhanced platform-specific logic
    if (isPlatformIOS) {
      // iOS prefers slide transitions, but adapt for landscape/foldable
      if (isLandscape || isFoldable) return 'fade';
      return 'slide';
    }
    
    if (isPlatformAndroid) {
      // Android typically uses fade, but slide for tablets in landscape
      if (isTablet && isLandscape) return 'slide';
      return 'fade';
    }
    
    // Web platform - adapt based on screen size
    if (isMobile) return 'slide';
    if (isTablet) return 'fade';
    return 'zoom'; // Desktop can handle more complex animations
  };
  
  const getOptimalDuration = (): number => {
    if (duration) return duration;
    
    // Shorter transitions for mobile for better performance
    if (isMobile) return 0.2;
    if (isTablet) return 0.25;
    return 0.3; // Desktop can handle longer transitions
  };
  
  const getDirection = () => {
    // Simple heuristic for slide direction based on navigation
    const currentPath = location.pathname;
    
    // Common navigation patterns
    if (currentPath.includes('/orders') || currentPath.includes('/profile')) {
      return 'left'; // Going deeper into app
    }
    if (currentPath === '/' || currentPath === '/customer') {
      return 'right'; // Going back to main areas
    }
    
    return 'right'; // Default
  };
  
  const transitionType = getOptimalTransition();
  const transitionDuration = getOptimalDuration();
  const transitionIdentifier = identifier || location.pathname;
  const direction = getDirection();
  
  return (
    <ScreenTransition 
      identifier={transitionIdentifier}
      type={transitionType}
      direction={direction}
      duration={transitionDuration}
      className={className}
    >
      {children}
    </ScreenTransition>
  );
};

export default PageTransition;
