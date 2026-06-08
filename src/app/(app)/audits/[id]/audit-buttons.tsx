"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function RunAuditButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "AI analyseert website..." : "Start AI-analyse"}
    </Button>
  );
}
