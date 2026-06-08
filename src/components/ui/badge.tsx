import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "orange" | "pink" | "violet" | "green" | "red";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-muted border-surface-border",
  orange: "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  pink: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
  violet: "bg-brand-violet/15 text-brand-violet border-brand-violet/30",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
