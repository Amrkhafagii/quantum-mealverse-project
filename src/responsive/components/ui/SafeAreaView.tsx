
import React from 'react';
import { Platform } from '../../utils/platform';
import { useIsMobile } from '../../core/hooks/useIsMobile';

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
  disableTop?: boolean;
  disableBottom?: boolean;
  disableSides?: boolean;
  as?: React.ElementType;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  className = '',
  disableTop = false,
  disableBottom = false,
  disableSides = false,
  as: Component = 'div'
}) => {
  const isMobile = useIsMobile();
  
  let safeAreaClasses = className;
  
  if (isMobile) {
    // Add safe area classes based on platform
    if (!disableTop) {
      safeAreaClasses += ' pt-safe';
    }
    
    if (!disableBottom) {
      safeAreaClasses += ' pb-safe';
    }
    
    if (!disableSides) {
      safeAreaClasses += ' px-safe';
    }
    
    // Add platform-specific classes
    if (Platform.isIOS()) {
      safeAreaClasses += ' ios-specific';
    } else if (Platform.isAndroid()) {
      safeAreaClasses += ' android-specific';
    }
  }
  
  return (
    <Component className={safeAreaClasses.trim()}>
      {children}
    </Component>
  );
};

export default SafeAreaView;
