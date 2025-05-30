import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/responsive/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Platform } from '@/responsive/utils';

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
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
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
    switch (currentTransition) {
      case 'slide':
        let initial = {};
        let animate = { x: 0, y: 0, opacity: 1 };
        let exit = {};
        
        switch (direction) {
          case 'left':
            initial = { x: -20, opacity: 0 };
            exit = { x: 20, opacity: 0 };
            break;
          case 'right':
            initial = { x: 20, opacity: 0 };
            exit = { x: -20, opacity: 0 };
            break;
          case 'up':
            initial = { y: -20, opacity: 0 };
            exit = { y: 20, opacity: 0 };
            break;
          case 'down':
            initial = { y: 20, opacity: 0 };
            exit = { y: -20, opacity: 0 };
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
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.95, opacity: 0 }
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
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={identifier}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={{ 
          duration, 
          ease: isPlatformIOS ? 'easeInOut' : 'easeOut' 
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenTransition;
