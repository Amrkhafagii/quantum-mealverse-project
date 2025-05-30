
import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface MobileTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
}

const sizeClasses = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-sm sm:text-base md:text-lg',
  lg: 'text-base sm:text-lg md:text-xl',
  xl: 'text-lg sm:text-xl md:text-2xl',
  '2xl': 'text-xl sm:text-2xl md:text-3xl',
  '3xl': 'text-2xl sm:text-3xl md:text-4xl',
  '4xl': 'text-3xl sm:text-4xl md:text-5xl',
  '5xl': 'text-4xl sm:text-5xl md:text-6xl',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const MobileText: React.FC<MobileTextProps> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  as: Component = 'span',
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        isMobile && 'leading-relaxed', // Better line height on mobile
        className
      )}
    >
      {children}
    </Component>
  );
};

export default MobileText;
