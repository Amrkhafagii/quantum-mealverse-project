
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';

interface AdaptiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  interactive?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export const AdaptiveCard = React.forwardRef<HTMLDivElement, AdaptiveCardProps>(({
  children,
  className,
  title,
  description,
  footer,
  contentClassName,
  headerClassName,
  footerClassName,
  interactive = false,
  onPress,
  disabled = false,
}, ref) => {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();

  // Platform-specific styling
  const getCardStyles = () => {
    const baseStyles = "overflow-hidden transition-shadow";

    if (isPlatformIOS) {
      return cn(
        baseStyles,
        "rounded-xl shadow-sm border-gray-200",
        interactive && !disabled ? "active:opacity-80" : "",
        disabled ? "opacity-60" : "",
        className
      );
    }

    if (isPlatformAndroid) {
      return cn(
        baseStyles,
        "rounded-lg shadow-sm",
        interactive && !disabled ? "active:shadow-md" : "",
        disabled ? "opacity-70" : "",
        className
      );
    }

    return cn(
      baseStyles,
      interactive && !disabled ? "hover:shadow-md" : "",
      disabled ? "opacity-70" : "",
      className
    );
  };

  const getHeaderStyles = () => {
    if (isPlatformIOS) {
      return cn("pb-2", headerClassName);
    }

    if (isPlatformAndroid) {
      return cn("pb-1", headerClassName);
    }

    return headerClassName;
  };

  const getTitleStyles = () => {
    if (isPlatformIOS) {
      return "font-semibold text-xl";
    }

    if (isPlatformAndroid) {
      return "font-medium text-lg";
    }

    return "";
  };

  const getDescriptionStyles = () => {
    if (isPlatformIOS) {
      return "text-gray-500";
    }

    if (isPlatformAndroid) {
      return "text-gray-600 text-sm";
    }

    return "";
  };

  const getContentStyles = () => {
    if (isPlatformIOS) {
      return cn("pt-0", contentClassName);
    }

    if (isPlatformAndroid) {
      return cn("pt-1", contentClassName);
    }

    return contentClassName;
  };

  const getFooterStyles = () => {
    if (isPlatformIOS) {
      return cn("border-t border-gray-100 bg-gray-50/50", footerClassName);
    }

    if (isPlatformAndroid) {
      return cn("border-t border-gray-100", footerClassName);
    }

    return footerClassName;
  };

  const handleClick = () => {
    if (interactive && onPress && !disabled) {
      onPress();
    }
  };

  return (
    <Card
      ref={ref}
      className={getCardStyles()}
      onClick={handleClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={disabled}
    >
      {(title || description) && (
        <CardHeader className={getHeaderStyles()}>
          {title && <CardTitle className={getTitleStyles()}>{title}</CardTitle>}
          {description && <CardDescription className={getDescriptionStyles()}>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className={getContentStyles()}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className={getFooterStyles()}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
});

AdaptiveCard.displayName = "AdaptiveCard";
