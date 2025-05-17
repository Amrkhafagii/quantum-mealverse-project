
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { hapticFeedback } from "@/utils/hapticFeedback";

interface TouchFriendlyButtonProps extends ButtonProps {
  touchClassName?: string;
  hapticEffect?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'confirmation' | 'longPress';
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  className = "",
  touchClassName = "",
  hapticEffect = "medium",
  onClick,
  ...props
}) => {
  const isMobile = useIsMobile();
  
  // Apply mobile-specific classes when on mobile
  const combinedClassName = isMobile 
    ? `${className} ${touchClassName} touch-button touch-feedback`
    : className;
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Apply haptic feedback on mobile devices
    if (isMobile) {
      hapticFeedback[hapticEffect]?.();
    }
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <Button 
      className={combinedClassName} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchFriendlyButton;
