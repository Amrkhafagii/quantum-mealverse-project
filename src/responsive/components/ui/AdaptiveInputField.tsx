
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useResponsive } from '../../core/ResponsiveContext';
import { cn } from '@/lib/utils';

interface AdaptiveInputFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  className?: string;
  rows?: number;
}

export const AdaptiveInputField: React.FC<AdaptiveInputFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  type = 'text',
  className,
  rows = 3,
}) => {
  const { control } = useFormContext();
  const { isMobile, isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const inputClasses = cn(
    // Mobile optimizations
    isMobile && [
      'text-base', // Prevents zoom on iOS
      'touch-manipulation',
    ],
    
    // Platform-specific styles
    isPlatformIOS && 'ios-input',
    isPlatformAndroid && 'android-input',
    
    className
  );
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                className={inputClasses}
                rows={rows}
                {...field}
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                className={inputClasses}
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AdaptiveInputField;
