import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "orange" | "pink" | "violet" | "green" | "red";

const tones: Record<Tone, string> = {
  neutral: "bg-white/[0.06] text-white/50 border-white/[0.08]",
  orange: "bg-[#f97316]/10 text-[#fb923c] border-[#f97316]/20",
  pink: "bg-[#ec4899]/10 text-[#f472b6] border-[#ec4899]/20",
  violet: "bg-[#a78bfa]/10 text-[#c4b5fd] border-[#a78bfa]/20",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
