
import React, { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

interface MobileFormProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  adjustForKeyboard?: boolean;
}

export const MobileForm = React.forwardRef<HTMLFormElement, MobileFormProps>(({
  children,
  className,
  onSubmit,
  defaultValues = {},
  adjustForKeyboard = true,
  ...props
}, ref) => {
  const { isMobile, isPlatformIOS } = useResponsive();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeField, setActiveField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm({
    defaultValues,
    mode: 'onSubmit'
  });

  // Handle keyboard appearance on mobile
  useEffect(() => {
    if (!isMobile || !adjustForKeyboard) return;

    const handleResize = () => {
      if (Platform.isNative()) {
        // On native platforms, use viewport height changes to detect keyboard
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.screen.height;
        const heightDiff = windowHeight - viewportHeight;
        
        setKeyboardHeight(heightDiff > 150 ? heightDiff : 0);
      } else {
        // On web, listen for viewport changes
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const initialHeight = window.innerHeight;
        const heightDiff = initialHeight - viewportHeight;
        
        setKeyboardHeight(heightDiff > 100 ? heightDiff : 0);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setActiveField(target.id || target.name || 'unknown');
        
        // Scroll active field into view on iOS
        if (isPlatformIOS) {
          setTimeout(() => {
            target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }, 300);
        }
      }
    };

    const handleFocusOut = () => {
      setActiveField(null);
    };

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Listen for focus events
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile, isPlatformIOS, adjustForKeyboard]);

  const handleFormSubmit = async (data: any) => {
    // Provide haptic feedback on form submission
    if (Platform.isNative()) {
      await hapticFeedback.success();
    }
    
    onSubmit(data);
  };

  const formClassName = cn(
    'space-y-6',
    isMobile && 'touch-manipulation',
    adjustForKeyboard && keyboardHeight > 0 && 'keyboard-active',
    className
  );

  const containerStyle = adjustForKeyboard && keyboardHeight > 0 ? {
    paddingBottom: isPlatformIOS ? keyboardHeight * 0.3 : keyboardHeight * 0.2,
    transition: 'padding-bottom 0.3s ease-out'
  } : {};

  return (
    <div style={containerStyle}>
      <FormProvider {...form}>
        <form
          ref={ref || formRef}
          className={formClassName}
          onSubmit={form.handleSubmit(handleFormSubmit)}
          {...props}
        >
          {children}
        </form>
      </FormProvider>
    </div>
  );
});

MobileForm.displayName = "MobileForm";

// Mobile-optimized input field
interface MobileInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hapticOnFocus?: boolean;
}

export const MobileInputField = React.forwardRef<HTMLInputElement, MobileInputFieldProps>(({
  label,
  error,
  hapticOnFocus = true,
  className,
  onFocus,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();

  const handleFocus = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (hapticOnFocus && Platform.isNative()) {
      await hapticFeedback.selection();
    }
    onFocus?.(e);
  };

  const inputClassName = cn(
    'flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3',
    'text-base ring-offset-background transition-colors',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    isMobile && 'text-16px', // Prevent zoom on iOS
    error && 'border-red-500 focus-visible:ring-red-500',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClassName}
        onFocus={handleFocus}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

MobileInputField.displayName = "MobileInputField";
