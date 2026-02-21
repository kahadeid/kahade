import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui-utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "transition-all duration-200 select-none cursor-pointer",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.125rem] [&_svg]:shrink-0",
    "active:scale-[0.99]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm rounded-xl hover:bg-primary/90 hover:-translate-y-[2px] hover:shadow-md focus-visible:ring-primary",
        destructive: "bg-destructive text-white shadow-sm rounded-xl hover:bg-destructive/90 hover:-translate-y-[2px] focus-visible:ring-destructive",
        outline: "border-2 border-border bg-transparent text-foreground rounded-xl hover:border-foreground hover:bg-foreground hover:text-background hover:-translate-y-[2px] focus-visible:ring-foreground",
        secondary: "border border-border bg-background text-foreground rounded-xl hover:border-foreground/50 hover:bg-muted focus-visible:ring-foreground",
        ghost: "bg-transparent text-muted-foreground rounded-xl hover:text-foreground hover:bg-muted focus-visible:ring-foreground",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
      },
      size: {
        xs: "h-7 px-3 py-1 text-xs rounded-lg gap-1",
        sm: "h-9 px-4 py-2 text-sm rounded-xl",
        default: "h-11 px-6 py-3 text-[0.9375rem]",
        lg: "h-12 px-8 py-3 text-base rounded-xl",
        xl: "h-14 px-10 py-4 text-lg rounded-2xl",
        icon: "size-10 rounded-xl p-0",
        "icon-sm": "size-8 rounded-lg p-0",
        "icon-lg": "size-12 rounded-xl p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
