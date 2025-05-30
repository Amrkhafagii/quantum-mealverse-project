import { useForm } from 'react-hook-form';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

export function useAdaptiveForm(options = {}) {
  const { isMobile } = useResponsive();
  
  // Configure form with mobile-specific options
  const form = useForm({
    mode: isMobile ? 'onSubmit' : 'onChange',
    reValidateMode: isMobile ? 'onSubmit' : 'onChange',
    shouldFocusError: !isMobile, // Don't auto-focus errors on mobile
    ...options
  });
  
  return {
    ...form,
    isMobile
  };
}
