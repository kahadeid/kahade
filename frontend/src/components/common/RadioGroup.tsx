/**
 * RADIO GROUP COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Radio button groups for single selection
 * NO PLACEHOLDERS - Works immediately
 */

import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name?: string;
  label?: string;
  description?: string;
  error?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  variant?: 'default' | 'card';
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function RadioGroup({
  value,
  onChange,
  options,
  name,
  label,
  description,
  error,
  layout = 'vertical',
  variant = 'default',
  disabled = false,
  required = false,
  className,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupName = name || generatedId;
  const labelId = `${groupName}-label`;
  const descriptionId = `${groupName}-description`;
  const errorId = `${groupName}-error`;

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledOptions = options.filter(opt => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex(opt => opt.value === value);

    let newIndex = currentEnabledIndex;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (currentEnabledIndex + 1) % enabledOptions.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = currentEnabledIndex === 0 ? enabledOptions.length - 1 : currentEnabledIndex - 1;
    }

    if (newIndex !== currentEnabledIndex) {
      onChange(enabledOptions[newIndex].value);
    }
  };

  const layoutClasses = {
    vertical: 'flex flex-col gap-3',
    horizontal: 'flex flex-wrap gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          id={labelId}
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600 dark:text-gray-400 mb-3"
        >
          {description}
        </p>
      )}

      {/* Radio Options */}
      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-errormessage={error ? errorId : undefined}
        className={layoutClasses[layout]}
      >
        {options.map((option, index) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;
          const optionId = `${groupName}-${option.value}`;

          if (variant === 'card') {
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  'relative flex items-start p-4 rounded-lg border-2 cursor-pointer',
                  'transition-all duration-200',
                  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                  isChecked
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  layout === 'horizontal' && 'flex-1 min-w-[200px]'
                )}
              >
                <input
                  type="radio"
                  id={optionId}
                  name={groupName}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="sr-only"
                />

                {/* Icon */}
                {option.icon && (
                  <div className="flex-shrink-0 mr-3 mt-0.5" aria-hidden="true">
                    {option.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-medium text-sm',
                        isChecked
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      )}
                    >
                      {option.label}
                    </span>
                    {isChecked && (
                      <Check className="w-5 aria-hidden="true" h-5 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  {option.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            );
          }

          // Default variant
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'flex items-start cursor-pointer',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                id={optionId}
                name={groupName}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  'text-blue-600 bg-white dark:bg-gray-800',
                  'border-gray-300 dark:border-gray-600',
                  'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isDisabled && 'cursor-not-allowed'
                )}
              />
              <div className="ml-3 flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 mt-2"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic radio group
// const [plan, setPlan] = useState('free');
// <RadioGroup
//   value={plan}
//   onChange={setPlan}
//   label="Choose your plan"
//   options={[
//     { value: 'free', label: 'Free' },
//     { value: 'pro', label: 'Pro' },
//     { value: 'enterprise', label: 'Enterprise' },
//   ]}
// />

// Example 2: Radio with descriptions
// <RadioGroup
//   value={method}
//   onChange={setMethod}
//   label="Payment method"
//   options={[
//     {
//       value: 'card',
//       label: 'Credit Card',
//       description: 'Pay with Visa, Mastercard, or Amex',
//     },
//     {
//       value: 'bank',
//       label: 'Bank Transfer',
//       description: 'Direct transfer from your bank account',
//     },
//     {
//       value: 'crypto',
//       label: 'Cryptocurrency',
//       description: 'Pay with Bitcoin or Ethereum',
//     },
//   ]}
// />

// Example 3: Card variant
// <RadioGroup
//   value={delivery}
//   onChange={setDelivery}
//   variant="card"
//   layout="grid"
//   options={[
//     {
//       value: 'standard',
//       label: 'Standard Delivery',
//       description: '5-7 business days',
//       icon: <Truck className="w-5 aria-hidden="true" h-5" />,
//     },
//     {
//       value: 'express',
//       label: 'Express Delivery',
//       description: '2-3 business days',
//       icon: <Zap className="w-5 aria-hidden="true" h-5" />,
//     },
//   ]}
// />

// Example 4: Horizontal layout
// <RadioGroup
//   value={size}
//   onChange={setSize}
//   layout="horizontal"
//   label="Size"
//   options={[
//     { value: 'sm', label: 'Small' },
//     { value: 'md', label: 'Medium' },
//     { value: 'lg', label: 'Large' },
//   ]}
// />

// Example 5: With disabled option
// <RadioGroup
//   value={subscription}
//   onChange={setSubscription}
//   variant="card"
//   options={[
//     { value: 'free', label: 'Free Plan' },
//     { value: 'pro', label: 'Pro Plan' },
//     {
//       value: 'enterprise',
//       label: 'Enterprise Plan',
//       description: 'Contact sales',
//       disabled: true,
//     },
//   ]}
// />

// Example 6: Form integration
// function TransactionForm() {
//   const [type, setType] = useState('');
//   const [errors, setErrors] = useState({});
//   
//   return (
//     <form>
//       <RadioGroup
//         value={type}
//         onChange={setType}
//         label="Transaction Type"
//         description="Choose how you want to proceed"
//         error={errors.type}
//         required
//         variant="card"
//         options={[
//           {
//             value: 'buy',
//             label: 'Buy',
//             description: 'Purchase goods or services',
//           },
//           {
//             value: 'sell',
//             label: 'Sell',
//             description: 'Sell your products',
//           },
//         ]}
//       />
//     </form>
//   );
// }

// Example 7: Settings selection
// <RadioGroup
//   value={theme}
//   onChange={setTheme}
//   label="Theme"
//   variant="card"
//   layout="grid"
//   options={[
//     {
//       value: 'light',
//       label: 'Light',
//       icon: <Sun className="w-5 aria-hidden="true" h-5" />,
//     },
//     {
//       value: 'dark',
//       label: 'Dark',
//       icon: <Moon className="w-5 aria-hidden="true" h-5" />,
//     },
//     {
//       value: 'auto',
//       label: 'Auto',
//       icon: <Monitor className="w-5 aria-hidden="true" h-5" />,
//     },
//   ]}
// />
