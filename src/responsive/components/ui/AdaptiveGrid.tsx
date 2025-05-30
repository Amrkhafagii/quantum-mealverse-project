
import React from 'react';
import { useResponsive } from '../../core/ResponsiveContext';
import { cn } from '@/lib/utils';
import { Platform } from '../../utils/platform';

interface AdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columns: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4 | 6;
    desktop?: 1 | 2 | 3 | 4 | 6 | 12;
  };
  masonry?: boolean;
  itemClassName?: string;
  aspectRatio?: string; // e.g., '1/1', '16/9', etc.
  equalHeight?: boolean;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className,
  gap = 'md',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  masonry = false,
  itemClassName = '',
  aspectRatio,
  equalHeight = false,
}) => {
  const { 
    isMobile, 
    isTablet, 
    isLandscape, 
    isPlatformIOS,
    isPlatformAndroid 
  } = useResponsive();
  
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
  
  // Apply platform-specific styling
  const getPlatformClasses = () => {
    if (isPlatformIOS) {
      // iOS generally has more rounded corners and subtle shadows
      return 'rounded-lg';
    } else if (isPlatformAndroid) {
      // Material design has sharper corners and more pronounced shadows
      return 'rounded-md';
    }
    return '';
  };
  
  // Handle masonry layout
  const renderMasonry = () => {
    if (!masonry) return null;
    
    // Split children into columns
    const childrenArray = React.Children.toArray(children);
    const columns: React.ReactNode[][] = [];
    
    for (let i = 0; i < columnCount; i++) {
      columns.push([]);
    }
    
    // Distribute children evenly across columns
    childrenArray.forEach((child, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(
        <div key={index} className={cn('mb-4', itemClassName, getPlatformClasses())}>
          {child}
        </div>
      );
    });
    
    // Render columns
    return (
      <div className={cn('flex', gapClasses[gap], className)}>
        {columns.map((columnChildren, index) => (
          <div key={index} className="flex-1">
            {columnChildren}
          </div>
        ))}
      </div>
    );
  };
  
  // Standard grid layout
  if (!masonry) {
    let itemClasses = cn(itemClassName, getPlatformClasses());
    if (aspectRatio) {
      itemClasses = cn(itemClasses, `aspect-[${aspectRatio}]`);
    }
    if (equalHeight) {
      itemClasses = cn(itemClasses, 'h-full');
    }
    
    // If we have aspect ratio or equal height, wrap each child
    const wrappedChildren = aspectRatio || equalHeight || itemClassName
      ? React.Children.map(children, (child) => (
          <div className={itemClasses}>{child}</div>
        ))
      : children;
      
    return (
      <div
        className={cn(
          'grid',
          gridColsClass,
          gapClasses[gap],
          className
        )}
      >
        {wrappedChildren}
      </div>
    );
  }
  
  // Masonry layout
  return renderMasonry();
};

export default AdaptiveGrid;
