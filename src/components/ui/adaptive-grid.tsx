
import React from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columns: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4 | 6;
    desktop?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className,
  gap = 'md',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const { isMobile, isTablet, isLandscape } = useResponsive();
  
  // Determine number of columns based on device type
  const getColumnCount = () => {
    if (isMobile && !isLandscape) {
      return columns.mobile || 1;
    } else if (isTablet || (isMobile && isLandscape)) {
      return columns.tablet || 2;
    } else {
      return columns.desktop || 3;
    }
  };
  
  // Map gap size to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  // Map column count to Tailwind grid template columns
  const columnCount = getColumnCount();
  const gridColsClass = `grid-cols-${columnCount}`;
  
  return (
    <div
      className={cn(
        'grid',
        gridColsClass,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default AdaptiveGrid;
