
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useResponsive } from '../../core/ResponsiveContext';

interface AdaptiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  mobileFullWidth?: boolean;
}

export const AdaptiveCard: React.FC<AdaptiveCardProps> = ({
  children,
  className,
  title,
  description,
  variant = 'default',
  mobileFullWidth = true,
}) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const cardClasses = cn(
    // Base styles
    'transition-all duration-200',
    
    // Mobile adaptations
    isMobile && [
      mobileFullWidth && 'w-full',
      'touch-manipulation',
    ],
    
    // Platform-specific styles
    isPlatformIOS && [
      variant === 'elevated' && 'shadow-lg',
      'rounded-xl',
    ],
    
    isPlatformAndroid && [
      variant === 'elevated' && 'shadow-md',
      'rounded-lg',
    ],
    
    // Variant styles
    variant === 'outlined' && 'border-2',
    
    className
  );
  
  if (title || description) {
    return (
      <Card className={cardClasses}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cardClasses}>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default AdaptiveCard;
