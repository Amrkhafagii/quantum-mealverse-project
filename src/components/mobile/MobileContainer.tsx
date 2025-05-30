
import React from 'react';
import SafeAreaView from './SafeAreaView';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  fullWidth?: boolean;
  disableSafeArea?: boolean;
}

const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = '',
  fullHeight = false,
  noPadding = false,
  fullWidth = false,
  disableSafeArea = false
}) => {
  const isMobile = useIsMobile();
  
  let containerClasses = className;
  containerClasses += ' transition-all duration-200';
  
  // Apply responsive classes
  if (fullHeight) {
    containerClasses += ' min-h-screen';
  }
  
  if (!noPadding) {
    containerClasses += isMobile 
      ? ' px-4 py-2' // Mobile padding
      : ' px-8 py-4'; // Desktop padding
  }
  
  if (!fullWidth) {
    containerClasses += isMobile
      ? ' w-full' // Full width on mobile
      : ' max-w-7xl mx-auto'; // Container with max width on desktop
  } else {
    containerClasses += ' w-full';
  }
  
  // Use SafeAreaView if not disabled
  if (disableSafeArea) {
    return <div className={containerClasses.trim()}>{children}</div>;
  }
  
  return (
    <SafeAreaView className={containerClasses.trim()}>
      {children}
    </SafeAreaView>
  );
};

export default MobileContainer;
