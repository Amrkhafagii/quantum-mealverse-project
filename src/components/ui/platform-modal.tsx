
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { X } from 'lucide-react';

export interface PlatformModalProps {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showButtons?: boolean;
  showCloseButton?: boolean;
  danger?: boolean;
  footerContent?: React.ReactNode;
}

export function PlatformModal({
  children,
  className,
  contentClassName,
  title,
  description,
  open,
  onOpenChange,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showButtons = true,
  showCloseButton = true,
  danger = false,
  footerContent,
}: PlatformModalProps) {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  // Get platform-specific styles for the modal content
  const getModalContentClasses = () => {
    if (isPlatformIOS) {
      return cn(
        "p-6 rounded-xl shadow-lg",
        isMobile ? "mx-4" : ""
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        "p-5 rounded-lg shadow-md",
        isMobile ? "mx-5" : ""
      );
    }
    
    return ""; // Default shadcn styles
  };
  
  // Handle confirm with haptic feedback
  const handleConfirm = () => {
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      danger ? hapticFeedback.warning() : hapticFeedback.success();
    }
    
    if (onConfirm) onConfirm();
  };
  
  // Handle cancel with haptic feedback
  const handleCancel = () => {
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      hapticFeedback.selection();
    }
    
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };
  
  // Get platform-specific button styles
  const getPrimaryButtonClasses = () => {
    if (isPlatformIOS) {
      return cn(
        danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600",
        "font-medium"
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        danger ? "bg-red-600 hover:bg-red-700" : "",
        "rounded-full"
      );
    }
    
    return danger ? "bg-destructive hover:bg-destructive/90" : "";
  };
  
  // Get platform-specific cancel button styles
  const getCancelButtonClasses = () => {
    if (isPlatformIOS) {
      return "text-blue-500 hover:bg-blue-50 border-0";
    }
    
    if (isPlatformAndroid) {
      return "rounded-full";
    }
    
    return "";
  };

  // Get overlay background styles based on platform
  const getOverlayStyle = () => {
    if (isPlatformIOS) {
      return "bg-black/30 backdrop-blur-sm";
    }
    
    if (isPlatformAndroid) {
      return "bg-black/40";
    }
    
    return "";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(getModalContentClasses(), contentClassName)}
        // Note: We're using style for backdrop since overlayClassName isn't supported
        style={{
          "--overlay-bg": isPlatformIOS ? "rgba(0,0,0,0.3)" : isPlatformAndroid ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.8)"
        } as React.CSSProperties}
      >
        {showCloseButton && (
          <button
            onClick={handleCancel}
            className={cn(
              "absolute rounded-full",
              isPlatformIOS ? "top-3 right-3 p-1.5 bg-gray-100" : 
              isPlatformAndroid ? "top-2 right-2 p-1.5" : 
              "top-4 right-4"
            )}
            aria-label="Close"
          >
            <X className={cn(
              "h-4 w-4",
              isPlatformIOS ? "text-gray-500" : 
              isPlatformAndroid ? "text-gray-600" : 
              ""
            )} />
          </button>
        )}
        
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className={cn(
                isPlatformIOS ? "text-center text-xl" : 
                isPlatformAndroid ? "text-lg font-medium" : 
                ""
              )}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className={cn(
                isPlatformIOS ? "text-center text-gray-500" : 
                isPlatformAndroid ? "text-gray-600" : 
                ""
              )}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        <div className={className}>
          {children}
        </div>
        
        {(showButtons || footerContent) && (
          <DialogFooter className={cn(
            isPlatformIOS ? "flex-col space-y-2" : 
            isPlatformAndroid ? "justify-end space-x-3" : 
            ""
          )}>
            {footerContent || (
              <>
                {(onCancel || onOpenChange) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className={getCancelButtonClasses()}
                  >
                    {cancelText}
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className={getPrimaryButtonClasses()}
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
