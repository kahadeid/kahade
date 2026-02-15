import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 outline-none",
        // Size - smaller on mobile, standard on larger screens
        "h-6 w-10 md:h-7 md:w-12",
        // Colors
        "data-[state=checked]:bg-black data-[state=unchecked]:bg-neutral-200",
        // Focus styles
        "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base styles
          "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          // Size
          "h-4 w-4 md:h-5 md:w-5",
          // Position
          "data-[state=checked]:translate-x-5 md:data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
