import React from 'react';
import { useResponsive } from '@/responsive/core';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { platform } from 'os';

interface PlatformNavigationBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backText?: string;
  actions?: React.ReactNode;
  className?: string;
  transparent?: boolean;
  largeTitle?: boolean; // iOS-style large title
  elevated?: boolean; // Android-style elevation
}

/**
 * Platform adaptive navigation bar that adjusts styling based on device
 */
export const PlatformNavigationBar: React.FC<PlatformNavigationBarProps> = ({
  title,
  subtitle,
  onBack,
  backText,
  actions,
  className = '',
  transparent = false,
  largeTitle = false,
  elevated = true
}) => {
  const { isPlatformIOS, isPlatformAndroid, safeAreaTop } = useResponsive();
  
  // Determine styles based on platform
  const getBarStyles = () => {
    let styles: React.CSSProperties = {};
    
    // Add safe area padding for native platforms
    if (safeAreaTop > 0) {
      styles.paddingTop = `${safeAreaTop}px`;
    }
    
    return styles;
  };
  
  // Get platform specific classes
  const getBarClasses = () => {
    let classes = 'flex w-full transition-all';
    
    // Common classes
    if (!transparent) {
      classes += ' bg-background';
      
      if (elevated) {
        classes += ' border-b border-border';
        
        if (isPlatformIOS) {
          classes += ' shadow-sm';
        } else if (isPlatformAndroid) {
          classes += ' shadow-md';
        }
      }
    }
    
    // iOS-specific styling
    if (isPlatformIOS) {
      if (largeTitle) {
        classes += ' flex-col items-start pt-1';
      } else {
        classes += ' h-12 items-center';
      }
    } 
    // Android-specific styling
    else if (isPlatformAndroid) {
      classes += ' h-14 items-center';
    }
    // Web styling
    else {
      classes += ' h-16 items-center';
    }
    
    return classes;
  };
  
  const renderBackButton = () => {
    // iOS style back button
    if (isPlatformIOS) {
      return (
        <Button
          variant="ghost"
          className="flex items-center px-2 gap-1 text-primary"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          {backText || 'Back'}
        </Button>
      );
    }
    
    // Android/web back button
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  };
  
  // Render iOS-style large title
  const renderLargeTitle = () => {
    if (!largeTitle || !isPlatformIOS) return null;
    
    return (
      <div className="px-4 pb-2 pt-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    );
  };
  
  // Render standard title bar
  const renderTitleBar = () => {
    return (
      <div className="flex w-full items-center px-2">
        {onBack && <div className="flex-shrink-0">{renderBackButton()}</div>}
        
        <div className={`flex-1 ${(isPlatformIOS && onBack) ? 'text-center' : 'px-4'}`}>
          {(!largeTitle || !isPlatformIOS) && (
            <div className="space-y-0.5">
              {title && (
                <h1 className={`font-medium ${isPlatformIOS ? 'text-base' : 'text-lg'}`}>
                  {title}
                </h1>
              )}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}
        </div>
        
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    );
  };

  return (
    <header 
      className={cn(getBarClasses(), className)} 
      style={getBarStyles()}
    >
      {renderTitleBar()}
      {renderLargeTitle()}
    </header>
  );
};

export default PlatformNavigationBar;
