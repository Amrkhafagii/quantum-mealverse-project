
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AccessibilityUtils } from '@/utils/accessibility';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  hideLabel?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(({
  id,
  label,
  description,
  errorMessage,
  isRequired = false,
  hideLabel = false,
  className,
  wrapperClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  disabled,
  ...props
}, ref) => {
  // Generate unique IDs for associated elements
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  
  // Combine all relevant IDs for aria-describedby
  const ariaDescribedBy = [
    descriptionId,
    errorId
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={cn('space-y-2', wrapperClassName)}>
      <Label 
        htmlFor={id}
        className={cn(
          hideLabel && 'sr-only',
          errorMessage && 'text-destructive',
          labelClassName
        )}
      >
        {label} {isRequired && <span aria-hidden="true">*</span>}
      </Label>
      
      {description && (
        <p 
          id={descriptionId} 
          className={cn('text-sm text-muted-foreground', descriptionClassName)}
        >
          {description}
        </p>
      )}
      
      <Input
        id={id}
        ref={ref}
        className={cn(
          errorMessage && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={!!errorMessage}
        aria-describedby={ariaDescribedBy}
        aria-required={isRequired}
        disabled={disabled}
        {...props}
      />
      
      {errorMessage && (
        <p 
          id={errorId} 
          className={cn('text-sm font-medium text-destructive', errorClassName)}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;
