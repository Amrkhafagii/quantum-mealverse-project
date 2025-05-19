
import React, { forwardRef } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';

interface PlatformFormProps {
  children?: React.ReactNode;
  className?: string;
  onSubmit: (data: any) => void;
  schema: z.ZodObject<any>;
  defaultValues?: Record<string, any>;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
}

export const PlatformForm = forwardRef<HTMLFormElement, PlatformFormProps>(({
  children,
  className,
  onSubmit,
  schema,
  defaultValues = {},
  submitText = "Submit",
  resetText = "Reset",
  showReset = false,
}, ref) => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: isMobile ? 'onChange' : 'onSubmit', // More responsive validation on mobile
  });

  // Get platform-specific styles
  const getPlatformClasses = () => {
    const baseClasses = "space-y-6";
    
    if (isPlatformIOS) {
      return cn(baseClasses, "ios-form rounded-2xl");
    }
    
    if (isPlatformAndroid) {
      return cn(baseClasses, "android-form");
    }
    
    return baseClasses;
  };

  // Handle form submission with haptic feedback
  const handleSubmit = (data: any) => {
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      hapticFeedback.success();
    }
    
    onSubmit(data);
  };

  // Handle form reset with haptic feedback
  const handleReset = () => {
    // Provide haptic feedback on native platforms
    if (Platform.isNative()) {
      hapticFeedback.warning();
    }
    
    form.reset(defaultValues);
  };

  return (
    <Form {...form}>
      <form 
        ref={ref}
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn(getPlatformClasses(), className)}
      >
        {children}
        
        <div className={cn(
          "flex gap-4 pt-4", 
          isPlatformIOS ? "justify-end" : "justify-start",
          isPlatformAndroid ? "flex-col-reverse" : "flex-row"
        )}>
          {showReset && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              className={isPlatformIOS ? "px-5" : ""}
            >
              {resetText}
            </Button>
          )}
          
          <Button 
            type="submit"
            className={cn(
              isPlatformIOS ? "px-5 bg-blue-500 hover:bg-blue-600" : "",
              isPlatformAndroid ? "rounded-full bg-primary" : ""
            )}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
});

PlatformForm.displayName = "PlatformForm";

// Helper component for platform-specific input styling
export const PlatformInput = ({ 
  name, 
  control, 
  label, 
  description,
  ...props 
}: { 
  name: string; 
  control: any; 
  label?: string; 
  description?: string;
  [key: string]: any;
}) => {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel className={cn(
            isPlatformIOS ? "text-blue-500" : "",
            isPlatformAndroid ? "text-sm font-normal" : ""
          )}>{label}</FormLabel>}
          <FormControl>
            <Input 
              {...field} 
              {...props}
              className={cn(
                field.value ? "" : "placeholder:opacity-50",
                isPlatformIOS ? "rounded-lg border-gray-300" : "",
                isPlatformAndroid ? "rounded-md border-gray-400" : "",
              )} 
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={cn(
            isPlatformIOS ? "text-red-500" : "",
            isPlatformAndroid ? "text-red-600 text-xs" : "",
          )} />
        </FormItem>
      )}
    />
  );
};
