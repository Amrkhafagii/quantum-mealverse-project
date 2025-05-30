
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface PlatformAwareDialogProps {
  children?: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function PlatformAwareDialog({
  children,
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false
}: PlatformAwareDialogProps) {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();

  const handleConfirm = () => {
    if (Platform.isNative()) {
      destructive ? hapticFeedback.warning() : hapticFeedback.success();
    }
    
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (Platform.isNative()) {
      hapticFeedback.selection();
    }
    
    onCancel?.();
    onOpenChange(false);
  };

  const getContentStyles = () => {
    if (isPlatformIOS) {
      return "rounded-2xl p-6";
    }
    
    if (isPlatformAndroid) {
      return "rounded-lg p-5";
    }
    
    return "";
  };

  const getHeaderStyles = () => {
    if (isPlatformIOS) {
      return "text-center";
    }
    
    if (isPlatformAndroid) {
      return "";
    }
    
    return "";
  };

  const getTitleStyles = () => {
    if (isPlatformIOS) {
      return "text-xl font-semibold";
    }
    
    if (isPlatformAndroid) {
      return "text-lg font-medium";
    }
    
    return "";
  };

  const getDescriptionStyles = () => {
    if (isPlatformIOS) {
      return "text-center text-gray-500";
    }
    
    if (isPlatformAndroid) {
      return "text-gray-600";
    }
    
    return "";
  };

  const getFooterStyles = () => {
    if (isPlatformIOS) {
      return "flex-col space-y-2";
    }
    
    if (isPlatformAndroid) {
      return "justify-end";
    }
    
    return "";
  };

  const getConfirmStyles = () => {
    if (isPlatformIOS) {
      return cn(
        "font-medium",
        destructive ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
      );
    }
    
    if (isPlatformAndroid) {
      return cn(
        "rounded-full",
        destructive ? "bg-red-600 hover:bg-red-700" : ""
      );
    }
    
    return destructive ? "bg-destructive hover:bg-destructive/90" : "";
  };

  const getCancelStyles = () => {
    if (isPlatformIOS) {
      return "text-blue-500 hover:bg-blue-50 border-0";
    }
    
    if (isPlatformAndroid) {
      return "rounded-full";
    }
    
    return "";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={getContentStyles()}>
        <AlertDialogHeader className={getHeaderStyles()}>
          <AlertDialogTitle className={getTitleStyles()}>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className={getDescriptionStyles()}>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        {children && <div className="py-3">{children}</div>}
        
        <AlertDialogFooter className={getFooterStyles()}>
          <AlertDialogCancel 
            onClick={handleCancel}
            className={getCancelStyles()}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={getConfirmStyles()}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
