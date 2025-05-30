
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

  // Enhanced mobile-first modal content classes
  const getModalContentClasses = () => {
    const baseClasses = "max-h-[85vh] overflow-y-auto";
    const mobileClasses = isMobile 
      ? "mx-4 my-8 w-[calc(100vw-2rem)] max-w-none" 
      : "max-w-lg";
    
    if (isPlatformIOS) {
      return cn(
        baseClasses,
        mobileClasses,
        "rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-md",
        isMobile ? "p-5" : "p-6"
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        baseClasses,
        mobileClasses,
        "rounded-lg shadow-md border border-gray-200",
        isMobile ? "p-4" : "p-5"
      );
    }
    
    return cn(baseClasses, mobileClasses);
  };
  
  // Handle confirm with haptic feedback
  const handleConfirm = () => {
    if (Platform.isNative()) {
      danger ? hapticFeedback.warning() : hapticFeedback.success();
    }
    
    if (onConfirm) onConfirm();
  };
  
  // Handle cancel with haptic feedback
  const handleCancel = () => {
    if (Platform.isNative()) {
      hapticFeedback.selection();
    }
    
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };
  
  // Enhanced platform-specific button styles with mobile optimization
  const getPrimaryButtonClasses = () => {
    const mobileSize = isMobile ? "min-h-[44px] px-6 text-base" : "px-4 py-2";
    
    if (isPlatformIOS) {
      return cn(
        mobileSize,
        danger ? "bg-red-500 hover:bg-red-600 active:bg-red-700" : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
        "font-medium rounded-lg transition-colors"
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        mobileSize,
        danger ? "bg-red-600 hover:bg-red-700 active:bg-red-800" : "",
        "rounded-full font-medium transition-colors"
      );
    }
    
    return cn(
      mobileSize,
      danger ? "bg-destructive hover:bg-destructive/90" : "",
      "transition-colors"
    );
  };
  
  // Enhanced cancel button styles with mobile optimization
  const getCancelButtonClasses = () => {
    const mobileSize = isMobile ? "min-h-[44px] px-6 text-base" : "px-4 py-2";
    
    if (isPlatformIOS) {
      return cn(
        mobileSize,
        "text-blue-500 hover:bg-blue-50 active:bg-blue-100 border-0 bg-transparent",
        "font-medium rounded-lg transition-colors"
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        mobileSize,
        "rounded-full transition-colors"
      );
    }
    
    return cn(mobileSize, "transition-colors");
  };

  // Enhanced close button with mobile-first design
  const getCloseButtonClasses = () => {
    const mobileSize = isMobile ? "top-4 right-4 p-2" : "top-3 right-3 p-1.5";
    
    if (isPlatformIOS) {
      return cn(
        "absolute rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors",
        mobileSize
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        "absolute rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors",
        mobileSize
      );
    }
    
    return cn("absolute rounded-sm transition-opacity hover:opacity-100", mobileSize);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(getModalContentClasses(), contentClassName)}
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && (
          <button
            onClick={handleCancel}
            className={getCloseButtonClasses()}
            aria-label="Close modal"
            type="button"
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
          <DialogHeader className={cn(
            isPlatformIOS ? "text-center space-y-3" : 
            isPlatformAndroid ? "space-y-2" : 
            "space-y-1.5"
          )}>
            {title && (
              <DialogTitle 
                id="modal-title"
                className={cn(
                  isPlatformIOS ? "text-xl font-semibold" : 
                  isPlatformAndroid ? "text-lg font-medium" : 
                  "text-lg font-semibold",
                  isMobile ? "text-base" : ""
                )}
              >
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription 
                id="modal-description"
                className={cn(
                  isPlatformIOS ? "text-gray-500" : 
                  isPlatformAndroid ? "text-gray-600" : 
                  "text-muted-foreground",
                  isMobile ? "text-sm" : ""
                )}
              >
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        <div className={cn("flex-1", className)}>
          {children}
        </div>
        
        {(showButtons || footerContent) && (
          <DialogFooter className={cn(
            isPlatformIOS ? "flex-col space-y-3 pt-4" : 
            isPlatformAndroid ? "flex-row justify-end space-x-3 pt-4" : 
            "flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            isMobile && !isPlatformIOS ? "flex-col space-y-3" : ""
          )}>
            {footerContent || (
              <>
                {(onCancel || onOpenChange) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className={getCancelButtonClasses()}
                    aria-label={`${cancelText} and close modal`}
                  >
                    {cancelText}
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className={getPrimaryButtonClasses()}
                    aria-label={danger ? `${confirmText} (this action is destructive)` : confirmText}
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
