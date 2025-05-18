
import React from 'react';
import { Platform } from '@/utils/platform';

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaView: React.FC<SafeAreaViewProps> = ({ children, className = '' }) => {
  // On web, we just render a div with the safe-area-inset CSS variables
  if (Platform.isWeb) {
    return (
      <div className={`${className} pt-safe pb-safe pl-safe pr-safe`}>
        {children}
      </div>
    );
  }

  // On native, we would use the React Native SafeAreaView
  // For this migration phase, we'll just render the children
  // This would be replaced with the actual SafeAreaView in a real implementation
  return <>{children}</>;
};

export default SafeAreaView;
