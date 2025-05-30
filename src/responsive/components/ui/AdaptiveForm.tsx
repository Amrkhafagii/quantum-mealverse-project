
import React, { forwardRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useResponsive } from '../../core/ResponsiveContext';
import { useNetworkQuality } from '../../core/hooks/useNetworkQuality';
import { cn } from '@/lib/utils';

interface AdaptiveFormProps {
  children?: React.ReactNode;
  onSubmit: (data: any) => void;
  schema: z.ZodObject<any>;
  defaultValues?: Record<string, any>;
  className?: string;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  adaptiveMode?: 'auto' | 'basic' | 'enhanced' | 'offline';
}

export const AdaptiveForm = forwardRef<HTMLFormElement, AdaptiveFormProps>(({
  children,
  onSubmit,
  schema,
  defaultValues = {},
  className,
  submitText = 'Submit',
  resetText = 'Reset',
  showReset = false,
  adaptiveMode = 'auto',
}, ref) => {
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const { quality, isLowQuality } = useNetworkQuality();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  // Determine form mode based on network and device
  const formMode = adaptiveMode === 'auto' 
    ? !navigator.onLine 
      ? 'offline'
      : isLowQuality
        ? 'basic'
        : 'enhanced' 
    : adaptiveMode;
  
  const formClasses = cn(
    'space-y-4',
    isMobile && 'touch-manipulation',
    isPlatformIOS && 'ios-form',
    isPlatformAndroid && 'android-form',
    formMode === 'offline' && 'border border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg p-4',
    className
  );
  
  const handleSubmit = form.handleSubmit(onSubmit);
  
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form 
          ref={ref}
          onSubmit={handleSubmit}
          className={formClasses}
          data-form-mode={formMode}
        >
          {children}
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {submitText}
            </Button>
            
            {showReset && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
              >
                {resetText}
              </Button>
            )}
          </div>
          
          {formMode === 'offline' && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              You're currently offline. Form data will be saved locally and submitted when you're back online.
            </div>
          )}
        </form>
      </Form>
    </FormProvider>
  );
});

AdaptiveForm.displayName = 'AdaptiveForm';

export default AdaptiveForm;
