"use client";

import { useRef, useState } from "react";
import { createIdea } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const levels = [
  ["LAAG", "Laag"],
  ["MIDDEL", "Middel"],
  ["HOOG", "Hoog"],
] as const;

function LevelField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue="MIDDEL">
        {levels.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function IdeaForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  if (!open) return <Button onClick={() => setOpen(true)}>Nieuw idee</Button>;

  return (
    <Card className="mb-6">
      <form
        ref={ref}
        action={async (fd) => {
          await createIdea(fd);
          ref.current?.reset();
          setOpen(false);
        }}
        className="grid gap-4"
      >
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input id="title" name="title" placeholder="Waar gaat het idee over?" required />
        </div>
        <div>
          <Label htmlFor="description">Omschrijving</Label>
          <Textarea id="description" name="description" placeholder="Korte toelichting" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <LevelField name="impact" label="Impact" />
          <LevelField name="effort" label="Moeite" />
          <LevelField name="urgency" label="Urgentie" />
          <div>
            <Label htmlFor="category">Categorie</Label>
            <Input id="category" name="category" placeholder="bijv. marketing" />
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
