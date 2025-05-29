
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  disableTop?: boolean;
  disableBottom?: boolean;
  disableSides?: boolean;
  as?: React.ElementType;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = '',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
  as: Component = 'div'
}) => {
  const { 
    isPlatformIOS, 
    isInitialized, 
    safeAreaTop,
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight
  } = useResponsive();
  
  // Wait for initialization to prevent race conditions
  if (!isInitialized) {
    return <Component className={className}>{children}</Component>;
  }
  
  // Build safe area classes
  const safeAreaClasses = React.useMemo(() => {
    const classes: string[] = [];
    
    if (isPlatformIOS) {
      if (!disableTop) {
        classes.push('pt-safe');
      }
      
      if (!disableBottom) {
        classes.push('pb-safe');
      }
      
      if (!disableSides) {
        classes.push('px-safe');
      }
      
      classes.push('ios-specific');
    }
    
    return classes.join(' ');
  }, [isPlatformIOS, disableTop, disableBottom, disableSides]);
  
  // Apply inline styles for safe area insets as fallback
  const safeAreaStyles = React.useMemo(() => {
    if (!isPlatformIOS) {
      return {};
    }
    
    const styles: React.CSSProperties = {};
    
    if (!disableTop && safeAreaTop > 0) {
      styles.paddingTop = `${safeAreaTop}px`;
    }
    
    if (!disableBottom && safeAreaBottom > 0) {
      styles.paddingBottom = `${safeAreaBottom}px`;
    }
    
    if (!disableSides) {
      if (safeAreaLeft > 0) {
        styles.paddingLeft = `${safeAreaLeft}px`;
      }
      
      if (safeAreaRight > 0) {
        styles.paddingRight = `${safeAreaRight}px`;
      }
    }
    
    return styles;
  }, [
    isPlatformIOS,
    disableTop,
    disableBottom,
    disableSides,
    safeAreaTop,
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight
  ]);
  
  return (
    <Component 
      className={cn(className, safeAreaClasses)} 
      style={safeAreaStyles}
    >
      {children}
    </Component>
  );
};

export default SafeAreaView;
