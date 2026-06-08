"use client";

import { useRef, useState } from "react";
import { createMemory } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const types = [
  ["MEMORY", "Memory"],
  ["INSIGHT", "Inzicht"],
  ["STRATEGY", "Strategie"],
  ["PROCESS", "Proces"],
  ["LESSON", "Les"],
  ["DECISION", "Beslissing"],
] as const;

export function MemoryForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Nieuw kennisitem</Button>
    );
  }

  return (
    <Card className="mb-6">
      <form
        ref={ref}
        action={async (fd) => {
          await createMemory(fd);
          ref.current?.reset();
          setOpen(false);
        }}
        className="grid gap-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" placeholder="Bijv. WebsUp verkoopt oplossingen" required />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue="STRATEGY">
              {types.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="body">Inhoud</Label>
          <Textarea
            id="body"
            name="body"
            placeholder="Wat moet de AI altijd weten en gebruiken?"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="priority">Prioriteit (1-10)</Label>
            <Input id="priority" name="priority" type="number" min={1} max={10} defaultValue={7} />
          </div>
          <div>
            <Label htmlFor="tags">Tags (komma-gescheiden)</Label>
            <Input id="tags" name="tags" placeholder="positionering, bouma" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Opslaan</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
        </div>
      </form>
    </Card>
  );
}
