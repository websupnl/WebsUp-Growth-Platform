import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-base text-white placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/60",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
