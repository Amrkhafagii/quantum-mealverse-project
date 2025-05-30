import React, { forwardRef, useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { AdaptiveFormOptions, useAdaptiveForm } from '@/hooks/useAdaptiveForm';
import { z } from 'zod';

interface AdaptiveFormProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  schema: z.ZodObject<any>;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  options?: AdaptiveFormOptions;
}

interface AdaptiveInputFieldProps extends React.HTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  type?: string;
}

export const AdaptiveForm = React.forwardRef<HTMLFormElement, AdaptiveFormProps>(({
  children,
  className,
  onSubmit: onSubmitWrapped,
  schema,
  defaultValues = {},
  submitText = "Submit",
  resetText = "Reset",
  showReset = false,
  options = {}
}, ref) => {
  const form = useForm({
    resolver: undefined,
    defaultValues,
    mode: 'onSubmit',
  });
  
  const adaptiveForm = useAdaptiveForm(form, options);
  const { isPlatformIOS, isPlatformAndroid } = adaptiveForm;
  const formRef = React.useRef<HTMLFormElement>(null);

  // Fix the type error with the handleSubmit function
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitHandler = await adaptiveForm.handleSubmit(onSubmitWrapped);
    submitHandler(e);
  };

  // Platform detection
  useEffect(() => {
    if (Platform.isNative()) {
      // Native platform adjustments
    } else {
      // Web platform adjustments
    }
  }, []);

  return (
    <form
      ref={formRef}
      className={cn(
        "space-y-6",
        className,
        isPlatformIOS ? "ios-form" : "",
        isPlatformAndroid ? "android-form" : ""
      )}
      onSubmit={onSubmit}
      noValidate={true}
    >
      <FormProvider {...form}>
        {children}
        <div className="flex justify-end space-x-2">
          {showReset && (
            <button
              type="reset"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() => form.reset(defaultValues)}
            >
              {resetText}
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={adaptiveForm.isSubmitting}
          >
            {submitText}
          </button>
        </div>
      </FormProvider>
    </form>
  );
});

AdaptiveForm.displayName = "AdaptiveForm";

export const AdaptiveInputField = ({
  name,
  label,
  description,
  ...props
}: AdaptiveInputFieldProps) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <>
            <input
              id={name}
              className={cn(
                "block w-full shadow-sm text-sm border rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500",
                fieldState.invalid
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              )}
              {...field}
              {...props}
            />
            {fieldState.error && (
              <p className="text-red-500 text-sm">{fieldState.error.message}</p>
            )}
            {description && (
              <p className="text-gray-500 text-sm">{description}</p>
            )}
          </>
        )}
      />
    </div>
  );
};
