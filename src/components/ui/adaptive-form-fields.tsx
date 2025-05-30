
import React, { useId } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form';
import { hapticFeedback } from '@/utils/hapticFeedback';

// Common props for all form fields
interface FormFieldBaseProps {
  label?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

// Input field component
export interface AdaptiveInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends FormFieldBaseProps {
  name: TName;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function AdaptiveInputField<
  TFieldValues extends FieldValues = FieldValues
>({
  name,
  label,
  description,
  type = "text",
  placeholder,
  className,
  required,
  autoComplete,
  onChange,
  onBlur,
}: AdaptiveInputFieldProps<TFieldValues>) {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const form = useFormContext<TFieldValues>();
  const id = useId();

  // Platform-specific styling
  const getInputStyles = () => {
    if (isPlatformIOS) {
      return "rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50";
    }
    
    if (isPlatformAndroid) {
      return "rounded-md border-gray-400 focus:border-primary focus:ring-0";
    }
    
    return "";
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel 
              htmlFor={`${id}-${name}`}
              className={cn(
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
                isPlatformIOS ? "text-gray-600" : "",
                isPlatformAndroid ? "text-sm font-normal" : ""
              )}
            >
              {label}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              id={`${id}-${name}`}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={cn(
                getInputStyles(),
                field.value ? "text-foreground" : "text-muted-foreground/60"
              )}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
                
                // Platform specific feedback on change
                if (isPlatformAndroid && Platform.isNative()) {
                  // Light haptic feedback on Android input change
                  hapticFeedback.selection();
                }
              }}
              onBlur={(e) => {
                field.onBlur();
                onBlur?.(e);
                
                // Platform specific feedback on blur
                if (isPlatformIOS && Platform.isNative()) {
                  const isValid = !form.formState.errors[name];
                  if (isValid && field.value) {
                    // Light haptic feedback on successful validation
                    hapticFeedback.selection();
                  }
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={cn(
            "form-error",
            isPlatformIOS ? "text-red-500 text-xs" : "",
            isPlatformAndroid ? "text-red-600 text-xs" : ""
          )} />
        </FormItem>
      )}
    />
  );
}

// Textarea field component
export interface AdaptiveTextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends FormFieldBaseProps {
  name: TName;
  placeholder?: string;
  rows?: number;
}

export function AdaptiveTextAreaField<
  TFieldValues extends FieldValues = FieldValues
>({
  name,
  label,
  description,
  placeholder,
  rows = 3,
  className,
  required,
}: AdaptiveTextAreaFieldProps<TFieldValues>) {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const form = useFormContext<TFieldValues>();
  const id = useId();

  // Platform-specific styling
  const getTextareaStyles = () => {
    if (isPlatformIOS) {
      return "rounded-lg border-gray-300 resize-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50";
    }
    
    if (isPlatformAndroid) {
      return "rounded-md border-gray-400 resize-none focus:border-primary focus:ring-0";
    }
    
    return "resize-none";
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel 
              htmlFor={`${id}-${name}`}
              className={cn(
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
                isPlatformIOS ? "text-gray-600" : "",
                isPlatformAndroid ? "text-sm font-normal" : ""
              )}
            >
              {label}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              {...field}
              id={`${id}-${name}`}
              placeholder={placeholder}
              rows={rows}
              className={cn(
                getTextareaStyles(),
                field.value ? "text-foreground" : "text-muted-foreground/60"
              )}
              onBlur={() => {
                if (isPlatformIOS && Platform.isNative()) {
                  const isValid = !form.formState.errors[name];
                  if (isValid && field.value) {
                    // Light haptic feedback on successful validation
                    hapticFeedback.selection();
                  }
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={cn(
            "form-error",
            isPlatformIOS ? "text-red-500 text-xs" : "",
            isPlatformAndroid ? "text-red-600 text-xs" : ""
          )} />
        </FormItem>
      )}
    />
  );
}

// Select field component
export interface AdaptiveSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends FormFieldBaseProps {
  name: TName;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export function AdaptiveSelectField<
  TFieldValues extends FieldValues = FieldValues
>({
  name,
  label,
  description,
  placeholder = "Select an option",
  options,
  className,
  required,
}: AdaptiveSelectFieldProps<TFieldValues>) {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const form = useFormContext<TFieldValues>();
  const id = useId();

  // Platform-specific styling
  const getSelectStyles = () => {
    if (isPlatformIOS) {
      return {
        trigger: "rounded-lg border-gray-300 focus:border-blue-500",
        content: "rounded-lg"
      };
    }
    
    if (isPlatformAndroid) {
      return {
        trigger: "rounded-md border-gray-400 focus:border-primary",
        content: "rounded-md"
      };
    }
    
    return {
      trigger: "",
      content: ""
    };
  };

  const styles = getSelectStyles();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel 
              htmlFor={`${id}-${name}`}
              className={cn(
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
                isPlatformIOS ? "text-gray-600" : "",
                isPlatformAndroid ? "text-sm font-normal" : ""
              )}
            >
              {label}
            </FormLabel>
          )}
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              
              // Platform-specific feedback
              if (Platform.isNative()) {
                hapticFeedback.selection();
              }
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger 
                id={`${id}-${name}`}
                className={cn(styles.trigger)}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={cn(styles.content)}>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className={cn(
            "form-error",
            isPlatformIOS ? "text-red-500 text-xs" : "",
            isPlatformAndroid ? "text-red-600 text-xs" : ""
          )} />
        </FormItem>
      )}
    />
  );
}

// Checkbox field component
export interface AdaptiveCheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends FormFieldBaseProps {
  name: TName;
}

export function AdaptiveCheckboxField<
  TFieldValues extends FieldValues = FieldValues
>({
  name,
  label,
  description,
  className,
  required,
}: AdaptiveCheckboxFieldProps<TFieldValues>) {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const form = useFormContext<TFieldValues>();
  const id = useId();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(
          "flex flex-row items-start space-x-3 space-y-0 rounded-md p-4",
          isPlatformIOS ? "border border-gray-200" : "",
          isPlatformAndroid ? "border border-gray-300" : "",
          className
        )}>
          <FormControl>
            <Checkbox
              id={`${id}-${name}`}
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                
                // Platform-specific feedback
                if (Platform.isNative()) {
                  hapticFeedback.selection();
                }
              }}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel
              htmlFor={`${id}-${name}`}
              className={cn(
                required && "after:content-['*'] after:ml-0.5 after:text-red-500",
                isPlatformIOS ? "text-gray-600" : "",
                isPlatformAndroid ? "text-sm font-normal" : ""
              )}
            >
              {label}
            </FormLabel>
            {description && (
              <FormDescription className="text-xs">
                {description}
              </FormDescription>
            )}
          </div>
          <FormMessage className={cn(
            "form-error",
            isPlatformIOS ? "text-red-500 text-xs" : "",
            isPlatformAndroid ? "text-red-600 text-xs" : ""
          )} />
        </FormItem>
      )}
    />
  );
}
