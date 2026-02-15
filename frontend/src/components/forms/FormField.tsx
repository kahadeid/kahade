/**
 * FORM FIELD COMPONENTS
 * 
 * FORM FIX [FE-FORM-001]: Reusable form components with validation
 * 
 * Provides consistent, accessible form controls integrated with react-hook-form
 */

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * Form Label Component
 */
export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function FormLabel({ required, children, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="wajib diisi">
          *
        </span>
      )}
    </label>
  );
}

/**
 * Form Error Component
 */
export interface FormErrorProps {
  error?: FieldError | string;
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <p
      className={cn(
        'text-sm text-red-600 dark:text-red-400 mt-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

/**
 * Form Helper Text Component
 */
export interface FormHelperTextProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHelperText({ children, className }: FormHelperTextProps) {
  return (
    <p
      className={cn(
        'text-sm text-gray-500 dark:text-gray-400 mt-1',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Form Field Wrapper
 */
export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: FieldError | string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  required,
  error,
  helperText,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <FormLabel required={required} htmlFor={htmlFor}>
          {label}
        </FormLabel>
      )}
      {children}
      {error && <FormError error={error} />}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </div>
  );
}

/**
 * Input Component with validation styling
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  registration?: UseFormRegisterReturn;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', registration, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-800 dark:text-gray-100',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        {...registration}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  registration?: UseFormRegisterReturn;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, registration, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-800 dark:text-gray-100',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        {...registration}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select Component
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  registration?: UseFormRegisterReturn;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, registration, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-800 dark:text-gray-100',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        {...registration}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

/**
 * Checkbox Component
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  registration?: UseFormRegisterReturn;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, registration, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-blue-600',
            'focus:ring-2 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          {...registration}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Radio Group Component
 */
export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  error?: boolean;
  registration?: UseFormRegisterReturn;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  error,
  registration,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)} role="radiogroup">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="radio"
            value={option.value}
            disabled={option.disabled}
            className={cn(
              'h-4 w-4 border-gray-300 text-blue-600',
              'focus:ring-2 focus:ring-blue-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500'
            )}
            aria-invalid={error ? 'true' : 'false'}
            {...registration}
          />
          <span
            className={cn(
              'text-sm text-gray-700 dark:text-gray-300',
              option.disabled && 'opacity-50'
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * USAGE EXAMPLES
 * 
 * 1. Simple input with validation:
 * ```tsx
 * <FormField
 *   label="Email"
 *   required
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * >
 *   <Input
 *     type="email"
 *     placeholder="email@example.com"
 *     error={!!errors.email}
 *     {...register('email')}
 *   />
 * </FormField>
 * ```
 * 
 * 2. Textarea:
 * ```tsx
 * <FormField label="Description" error={errors.description}>
 *   <Textarea
 *     placeholder="Enter description"
 *     error={!!errors.description}
 *     {...register('description')}
 *   />
 * </FormField>
 * ```
 * 
 * 3. Select:
 * ```tsx
 * <FormField label="Category" error={errors.category}>
 *   <Select
 *     options={[
 *       { value: '1', label: 'Category 1' },
 *       { value: '2', label: 'Category 2' },
 *     ]}
 *     placeholder="Select category"
 *     error={!!errors.category}
 *     {...register('category')}
 *   />
 * </FormField>
 * ```
 * 
 * 4. Checkbox:
 * ```tsx
 * <FormField error={errors.agreeToTerms}>
 *   <Checkbox
 *     label="I agree to the terms and conditions"
 *     error={!!errors.agreeToTerms}
 *     {...register('agreeToTerms')}
 *   />
 * </FormField>
 * ```
 * 
 * 5. Radio group:
 * ```tsx
 * <FormField label="Role" error={errors.role}>
 *   <RadioGroup
 *     name="role"
 *     options={[
 *       { value: 'buyer', label: 'Buyer' },
 *       { value: 'seller', label: 'Seller' },
 *     ]}
 *     error={!!errors.role}
 *     {...register('role')}
 *   />
 * </FormField>
 * ```
 */
