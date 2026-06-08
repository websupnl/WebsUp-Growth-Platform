import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white font-semibold hover:opacity-90 shadow-lg shadow-purple-900/20",
  secondary:
    "bg-white/[0.06] text-white/80 border border-white/[0.1] hover:bg-white/[0.1] hover:text-white",
  ghost: "text-white/40 hover:text-white hover:bg-white/[0.05]",
  danger:
    "bg-transparent text-red-400/80 border border-red-400/20 hover:bg-red-400/10 hover:text-red-400",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
