
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';

export interface AdaptiveFormOptions {
  onSuccess?: () => void;
  onError?: () => void;
  scrollToErrors?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  showFeedback?: boolean;
}

export function useAdaptiveForm(form: UseFormReturn<any, any>, options: AdaptiveFormOptions = {}) {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Platform-specific validation mode
  useEffect(() => {
    // iOS tends to validate on blur
    // Android tends to validate on change
    // Web typically validates on submit
    if (isPlatformIOS) {
      form.trigger(); // Trigger validation on form load for iOS
    }
  }, [isPlatformIOS, form]);

  // Handle platform-specific error scrolling
  useEffect(() => {
    if (!options.scrollToErrors || !hasSubmitted) return;
    
    const firstErrorField = document.querySelector('.form-error');
    if (firstErrorField) {
      // Add platform-specific scrolling
      if (isPlatformIOS) {
        // iOS has smoother inertial scrolling
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Haptic feedback on error
        if (Platform.isNative()) {
          hapticFeedback.error();
        }
      } else if (isPlatformAndroid) {
        // Android typically has more immediate scrolling
        firstErrorField.scrollIntoView({ behavior: 'auto', block: 'center' });
        
        // Haptic feedback on error
        if (Platform.isNative()) {
          hapticFeedback.warning();
        }
      } else {
        // Desktop behavior
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [form.formState.errors, hasSubmitted, options.scrollToErrors, isPlatformIOS, isPlatformAndroid]);

  // Platform-aware submission handler
  const handleSubmit = async (onSubmit: (values: any) => Promise<void> | void) => {
    return form.handleSubmit(async (values) => {
      setIsSubmitting(true);
      setHasSubmitted(true);
      
      try {
        await onSubmit(values);
        
        // Success feedback
        if (options.showFeedback && Platform.isNative()) {
          hapticFeedback.success();
        }
        
        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Error feedback
        if (options.showFeedback && Platform.isNative()) {
          hapticFeedback.error();
        }
        
        if (options.onError) {
          options.onError();
        }
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return {
    form,
    isSubmitting,
    hasSubmitted,
    handleSubmit,
    isPlatformIOS,
    isPlatformAndroid,
    isMobile,
  };
}
