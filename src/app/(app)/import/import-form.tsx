"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createImport } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Bezig met opslaan..." : "Opslaan en openen"}
    </Button>
  );
}

export function ImportForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Chat plakken</Button>;
  }

  return (
    <Card className="mb-6">
      <form action={createImport} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <Label htmlFor="title">Titel (optioneel)</Label>
            <Input id="title" name="title" placeholder="Waar ging het gesprek over?" />
          </div>
          <div>
            <Label htmlFor="source">Bron</Label>
            <Select id="source" name="source" defaultValue="CHATGPT">
              <option value="CHATGPT">ChatGPT</option>
              <option value="CLAUDE">Claude</option>
              <option value="CODEX">Codex</option>
              <option value="NOTES">Notitie</option>
              <option value="OTHER">Anders</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="rawContent">Plak hier het complete gesprek</Label>
          <Textarea
            id="rawContent"
            name="rawContent"
            className="min-h-64 font-mono text-sm"
            placeholder="Plak de hele chat. De ruwe tekst blijft altijd bewaard, AI maakt er daarna voorstellen van."
            required
          />
        </div>
        <div className="flex gap-2">
          <SubmitButton />
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
        </div>
      </form>
    </Card>
  );
}
