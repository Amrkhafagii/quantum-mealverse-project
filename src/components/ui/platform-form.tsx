
import React, { forwardRef } from 'react';
import { AdaptiveForm } from '@/components/ui/adaptive-form';
import { AdaptiveInputField } from '@/components/ui/adaptive-form-fields';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResponsive } from '@/contexts/ResponsiveContext';

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
  // Use AdaptiveForm which handles platform specifics
  return (
    <AdaptiveForm
      ref={ref}
      schema={schema}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      submitText={submitText}
      resetText={resetText}
      showReset={showReset}
      className={className}
    >
      {children}
    </AdaptiveForm>
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
  control?: any; 
  label?: string; 
  description?: string;
  [key: string]: any;
}) => {
  // Use AdaptiveInputField instead
  return (
    <AdaptiveInputField
      name={name}
      label={label}
      description={description}
      {...props}
    />
  );
};
