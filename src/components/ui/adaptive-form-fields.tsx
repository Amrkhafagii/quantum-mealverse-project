
import React, { useMemo } from "react";
import { Controller, useFormContext, FieldError } from "react-hook-form";
import { usePlatformStyles } from "@/hooks/usePlatformStyles";

/**
 * Props for adaptive input fields.
 */
interface AdaptiveInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  type?: string;
}

const ErrorMessage: React.FC<{ error?: FieldError }> = ({ error }) => {
  const { error: errorStyle } = usePlatformStyles();
  if (!error) return null;
  return <p className={errorStyle}>{error.message}</p>;
};

const FieldWrapper: React.FC<{
  label?: string;
  name: string;
  description?: string;
  children: React.ReactNode;
  error?: FieldError | undefined;
}> = ({ label, name, description, children, error }) => {
  const { label: labelStyle, description: descStyle } = usePlatformStyles();
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className={labelStyle}>
          {label}
        </label>
      )}
      {children}
      <ErrorMessage error={error} />
      {description && <p className={descStyle}>{description}</p>}
    </div>
  );
};

/**
 * Adaptive input tied to react-hook-form and platform styles
 */
export const AdaptiveInputField: React.FC<AdaptiveInputFieldProps> = ({
  name,
  label,
  description,
  type = "text",
  ...props
}) => {
  const { control, formState } = useFormContext();
  const { input: inputStyle } = usePlatformStyles();

  // Lookup error only once using useMemo for performance
  const error = useMemo(
    () =>
      formState.errors &&
      (formState.errors[name]?.message
        ? (formState.errors[name] as FieldError)
        : undefined),
    [formState.errors, name]
  );

  // Render with RHF controller to ensure controlled and platform style input
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldWrapper label={label} name={name} description={description} error={error}>
          <input
            id={name}
            className={inputStyle + (error ? " border-red-500" : "")}
            type={type}
            aria-invalid={!!error}
            {...field}
            {...props}
          />
        </FieldWrapper>
      )}
    />
  );
};
