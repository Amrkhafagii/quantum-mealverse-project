
import React, { forwardRef, useId } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAdaptiveForm } from '@/hooks/useAdaptiveForm';
import { Loader2 } from 'lucide-react';
import * as z from 'zod';

interface AdaptiveFormProps<TFormSchema extends z.ZodTypeAny> {
  schema: TFormSchema;
  onSubmit: (data: z.infer<TFormSchema>) => Promise<void> | void;
  defaultValues?: Partial<z.infer<TFormSchema>>;
  children?: React.ReactNode;
  className?: string;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  loading?: boolean;
  disabled?: boolean;
  scrollToErrors?: boolean;
  preventMultipleSubmits?: boolean;
}

export const AdaptiveForm = forwardRef<
  HTMLFormElement,
  AdaptiveFormProps<any>
>(({
  schema,
  onSubmit,
  defaultValues = {},
  children,
  className,
  submitText = "Submit",
  resetText = "Reset",
  showReset = false,
  loading = false,
  disabled = false,
  scrollToErrors = true,
  preventMultipleSubmits = true,
}, ref) => {
  const formId = useId();
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  
  // Create form with platform-specific validation mode
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: isPlatformIOS ? 'onBlur' : isPlatformAndroid ? 'onChange' : 'onSubmit',
  });
  
  const { 
    isSubmitting,
    handleSubmit
  } = useAdaptiveForm(form, { 
    scrollToErrors,
    showFeedback: true
  });

  // Platform-specific styles
  const getFormStyles = () => {
    const baseStyles = "space-y-6";
    
    if (isPlatformIOS) {
      return cn(baseStyles, "ios-form");
    }
    
    if (isPlatformAndroid) {
      return cn(baseStyles, "android-form");
    }
    
    return baseStyles;
  };
  
  // Platform-specific button styles
  const getButtonStyles = () => {
    if (isPlatformIOS) {
      return "rounded-lg bg-blue-500 hover:bg-blue-600 text-white";
    }
    
    if (isPlatformAndroid) {
      return "rounded-full bg-primary";
    }
    
    return "";
  };

  // Handle form reset with platform-specific feedback
  const handleReset = () => {
    form.reset(defaultValues);
    
    if (Platform.isNative()) {
      // Need to import haptic utility
      if (isPlatformIOS) {
        navigator.vibrate && navigator.vibrate(10);
      } else {
        navigator.vibrate && navigator.vibrate([10, 30, 10]);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        ref={ref}
        onSubmit={handleSubmit(onSubmit)}
        className={cn(getFormStyles(), className)}
        noValidate
      >
        <div className="form-fields space-y-4">
          {children}
        </div>

        <div className={cn(
          "form-actions flex gap-4 pt-4",
          isPlatformIOS ? "justify-end" : "justify-start",
          isPlatformAndroid ? "flex-col-reverse" : "flex-row"
        )}>
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className={cn(
                isPlatformIOS ? "px-5 rounded-lg" : "",
                isPlatformAndroid ? "rounded-full" : ""
              )}
              disabled={isSubmitting || loading || disabled}
            >
              {resetText}
            </Button>
          )}

          <Button
            type="submit"
            className={cn(
              getButtonStyles(),
              "relative"
            )}
            disabled={(isSubmitting && preventMultipleSubmits) || loading || disabled}
          >
            {(isSubmitting || loading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
});

AdaptiveForm.displayName = "AdaptiveForm";
