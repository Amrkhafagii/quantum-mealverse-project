
import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { AnimatePresence, motion } from 'framer-motion';

export type TransitionType = 'slide' | 'fade' | 'zoom' | 'none' | 'platform';

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  direction?: 'left' | 'right' | 'up' | 'down';
  identifier: string | number;
  className?: string;
  duration?: number;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = 'platform',
  direction = 'right',
  identifier,
  className = '',
  duration = 0.3
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);
  
  const getTransition = (): TransitionType => {
    if (type !== 'platform') {
      return type;
    }
    
    if (isPlatformIOS) {
      return 'slide';
    } else if (isPlatformAndroid) {
      return 'fade';
    }
    
    return 'fade';
  };
  
  const currentTransition = getTransition();
  
  if (isInitialRender) {
    return <div className={className}>{children}</div>;
  }
  
  const getAnimations = () => {
    // Enhanced animation configurations with better performance
    const slideDistance = isMobile ? 15 : 20; // Reduced distance for mobile
    
    switch (currentTransition) {
      case 'slide':
        let initial = {};
        let animate = { x: 0, y: 0, opacity: 1 };
        let exit = {};
        
        switch (direction) {
          case 'left':
            initial = { x: -slideDistance, opacity: 0.8 };
            exit = { x: slideDistance, opacity: 0.8 };
            break;
          case 'right':
            initial = { x: slideDistance, opacity: 0.8 };
            exit = { x: -slideDistance, opacity: 0.8 };
            break;
          case 'up':
            initial = { y: -slideDistance, opacity: 0.8 };
            exit = { y: slideDistance, opacity: 0.8 };
            break;
          case 'down':
            initial = { y: slideDistance, opacity: 0.8 };
            exit = { y: -slideDistance, opacity: 0.8 };
            break;
        }
        
        return { initial, animate, exit };
        
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
        
      case 'zoom':
        const scaleAmount = isMobile ? 0.98 : 0.95; // Less dramatic on mobile
        return {
          initial: { scale: scaleAmount, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: scaleAmount, opacity: 0 }
        };
        
      case 'none':
      default:
        return {
          initial: {},
          animate: {},
          exit: {}
        };
    }
  };
  
  const { initial, animate, exit } = getAnimations();
  
  // Enhanced easing curves for different platforms
  const getEasing = () => {
    if (isPlatformIOS) {
      return [0.25, 0.46, 0.45, 0.94]; // iOS-like easing
    } else if (isPlatformAndroid) {
      return [0.4, 0.0, 0.2, 1]; // Material Design easing
    }
    return 'easeOut'; // Web default
  };
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={identifier}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ 
          duration, 
          ease: getEasing(),
          // Optimize for mobile performance
          ...(isMobile && {
            type: "tween",
            stiffness: 300,
            damping: 30
          })
        }}
        className={className}
        // Performance optimizations
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenTransition;
