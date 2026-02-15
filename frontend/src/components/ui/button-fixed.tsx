/**
 * FIXED BUTTON COMPONENT
 * ======================
 * 
 * This component fixes K-002: Missing type attributes
 * 
 * Changes:
 * - Explicit type attribute (defaults to "button")
 * - Better TypeScript types
 * - Loading state support
 * - Accessibility improvements
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * Button Component with Proper Type Handling
 * 
 * Features:
 * - Explicit type attribute (button | submit | reset)
 * - Loading state with spinner
 * - Disabled when loading
 * - Accessible loading announcement
 * - Focus visible styles
 * 
 * @example
 * ```tsx
 * // Action button (default type="button")
 * <Button onClick={handleClick}>Click Me</Button>
 * 
 * // Submit button in form
 * <Button type="submit">Submit</Button>
 * 
 * // With loading state
 * <Button loading={isLoading} loadingText="Saving...">
 *   Save Changes
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      type = "button", // ✅ FIX: Default to "button" to prevent form submission
      ...props 
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    // Show loading text if provided, otherwise show children
    const buttonContent = loading && loadingText ? loadingText : children;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        type={type}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Spinner 
            className="h-4 w-4 animate-spin" 
            aria-hidden="true"
          />
        )}
        {buttonContent}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

/**
 * USAGE GUIDELINES:
 * ================
 * 
 * ✅ CORRECT:
 * -----------
 * <Button type="button" onClick={handleClick}>Action</Button>
 * <Button type="submit">Submit Form</Button>
 * <Button type="reset">Reset Form</Button>
 * <Button loading={isSubmitting}>Save</Button>
 * 
 * ❌ INCORRECT (Old way):
 * ----------------------
 * <button onClick={handleClick}>Action</button>  // Missing type
 * <Button disabled={isLoading}>Save</Button>      // Use loading prop instead
 * 
 * MIGRATION:
 * ----------
 * 1. Replace all <button> with <Button>
 * 2. Add explicit type="button" for action buttons
 * 3. Use type="submit" only in forms
 * 4. Use loading prop instead of manual spinner
 * 5. Remove manual disabled logic when loading
 */
