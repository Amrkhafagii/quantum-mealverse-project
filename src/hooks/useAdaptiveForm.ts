
import { useForm, UseFormReturn } from 'react-hook-form';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

export interface AdaptiveFormOptions {
  hapticFeedback?: boolean;
  autoScrollToError?: boolean;
  keyboardAdjustment?: boolean;
}

export interface AdaptiveFormReturn extends UseFormReturn {
  isPlatformIOS: boolean;
  isPlatformAndroid: boolean;
  isMobile: boolean;
  isSubmitting: boolean;
  handleSubmit: (onSubmit: (data: any) => void) => (e?: React.FormEvent) => Promise<void>;
}

export const useAdaptiveForm = (
  form: UseFormReturn,
  options: AdaptiveFormOptions = {}
): AdaptiveFormReturn => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const { 
    hapticFeedback: enableHaptic = true,
    autoScrollToError = true,
    keyboardAdjustment = true
  } = options;

  const handleSubmit = (onSubmit: (data: any) => void) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      const isValid = await form.trigger();
      
      if (!isValid) {
        // Provide error haptic feedback
        if (enableHaptic && Platform.isNative()) {
          await hapticFeedback.error();
        }
        
        // Auto-scroll to first error
        if (autoScrollToError) {
          const firstError = Object.keys(form.formState.errors)[0];
          if (firstError) {
            const element = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element?.focus();
          }
        }
        return;
      }

      // Provide success haptic feedback
      if (enableHaptic && Platform.isNative()) {
        await hapticFeedback.success();
      }

      const data = form.getValues();
      onSubmit(data);
    };
  };

  return {
    ...form,
    isPlatformIOS,
    isPlatformAndroid,
    isMobile,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
  };
};
