"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

// Knop met laad-status, voor de tragere AI-acties (analyse / alles opslaan).
export function PendingButton({
  children,
  pendingText,
  ...props
}: ButtonProps & { pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
