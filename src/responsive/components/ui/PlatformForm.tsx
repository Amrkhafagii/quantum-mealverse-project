
import React, { forwardRef } from 'react';
import { AdaptiveForm } from './AdaptiveForm';
import { AdaptiveInputField } from './AdaptiveInputField';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResponsive } from '../../core/ResponsiveContext';

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
  return (
    <AdaptiveInputField
      name={name}
      label={label}
      description={description}
      {...props}
    />
  );
};
