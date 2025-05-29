
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';

interface PlatformLoadingProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const PlatformLoading: React.FC<PlatformLoadingProps> = ({
  size = 'medium',
  className,
  text,
  variant = 'spinner'
}) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // iOS style loading indicator
  if (isPlatformIOS) {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-500',
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Android style loading indicator
  if (isPlatformAndroid) {
    if (variant === 'dots') {
      return (
        <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-pulse',
                  size === 'small' ? 'h-1 w-1' : size === 'large' ? 'h-3 w-3' : 'h-2 w-2'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          {text && (
            <p className={cn('text-gray-700', textSizeClasses[size])}>
              {text}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
        <div className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-primary',
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn('text-gray-700', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default web loading indicator
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className={cn('text-gray-600', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};
