
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = 'medium', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-quantum-cyan', sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
