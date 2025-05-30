import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core';

type TextStyle = 
  | 'caption2' 
  | 'caption1'
  | 'footnote'
  | 'subheadline'
  | 'callout'
  | 'body'
  | 'headline'
  | 'title3'
  | 'title2'
  | 'title1'
  | 'largeTitle';

// Define iOS text styles according to Apple's Human Interface Guidelines
const textStyles: Record<TextStyle, string> = {
  caption2: 'text-xs font-normal',
  caption1: 'text-xs font-medium',
  footnote: 'text-sm font-normal',
  subheadline: 'text-sm font-medium',
  callout: 'text-base font-normal',
  body: 'text-base font-normal',
  headline: 'text-base font-semibold',
  title3: 'text-lg font-semibold',
  title2: 'text-xl font-semibold',
  title1: 'text-2xl font-semibold',
  largeTitle: 'text-3xl sm:text-4xl font-bold',
};

interface DynamicTypeTextProps {
  children: React.ReactNode;
  style: TextStyle;
  className?: string;
  adjustsFontSizeToFit?: boolean;
  as?: React.ElementType;
}

export const DynamicTypeText: React.FC<DynamicTypeTextProps> = ({
  children,
  style,
  className,
  adjustsFontSizeToFit = false,
  as: Component = 'span'
}) => {
  const { isPlatformIOS } = useResponsive();
  
  return (
    <Component
      className={cn(
        textStyles[style],
        isPlatformIOS && 'ios-dynamic-type',
        adjustsFontSizeToFit && 'text-ellipsis overflow-hidden',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default DynamicTypeText;
