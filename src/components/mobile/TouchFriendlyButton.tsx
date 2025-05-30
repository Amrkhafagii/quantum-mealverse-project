
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface TouchFriendlyButtonProps extends ButtonProps {
  children: React.ReactNode;
  touchClassName?: string;
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  className,
  touchClassName,
  ...props
}) => {
  const { isMobile } = useResponsive();

  return (
    <Button
      className={cn(
        isMobile && 'min-h-[44px] px-6 text-base',
        isMobile && touchClassName,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchFriendlyButton;
export type { TouchFriendlyButtonProps };
