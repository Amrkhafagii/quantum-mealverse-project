
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface TouchFriendlyButtonProps extends ButtonProps {
  touchClassName?: string;
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  className = "",
  touchClassName = "",
  ...props
}) => {
  const isMobile = useIsMobile();
  
  // Apply mobile-specific classes when on mobile
  const combinedClassName = isMobile 
    ? `${className} ${touchClassName} touch-button touch-feedback`
    : className;
  
  return (
    <Button className={combinedClassName} {...props}>
      {children}
    </Button>
  );
};

export default TouchFriendlyButton;
