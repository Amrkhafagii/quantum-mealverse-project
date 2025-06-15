
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { PlatformContainer } from '@/components/layout/PlatformContainer';
import { AdaptiveLayout } from '@/components/layout/AdaptiveLayout';

interface ResponsiveFitnessLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveFitnessLayout: React.FC<ResponsiveFitnessLayoutProps> = ({
  children,
  className
}) => {
  const { isMobile, isTablet, isPlatformIOS } = useResponsive();

  return (
    <AdaptiveLayout
      containerVariant="default"
      className={className}
      breakpointBehavior={{
        forceMobileBelow: 'md'
      }}
      customLayoutRules={{
        mobileFirst: true,
        respectUserPreferences: true
      }}
    >
      <PlatformContainer
        variant="default"
        padding={isMobile ? "sm" : isTablet ? "md" : "lg"}
        maxWidth="2xl"
        fullHeight={true}
        safeArea={isPlatformIOS}
      >
        {children}
      </PlatformContainer>
    </AdaptiveLayout>
  );
};

export default ResponsiveFitnessLayout;
