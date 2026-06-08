import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/60",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
