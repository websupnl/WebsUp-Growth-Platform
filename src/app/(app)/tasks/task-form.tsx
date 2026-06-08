"use client";

import { useRef, useState } from "react";
import { createTask } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export function TaskForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  if (!open) return <Button onClick={() => setOpen(true)}>Nieuwe taak</Button>;

  return (
    <Card className="mb-6">
      <form
        ref={ref}
        action={async (fd) => {
          await createTask(fd);
          ref.current?.reset();
          setOpen(false);
        }}
        className="grid gap-4"
      >
        <div>
          <Label htmlFor="title">Wat moet er gebeuren?</Label>
          <Input id="title" name="title" placeholder="Concrete actie" required />
        </div>
        <div>
          <Label htmlFor="description">Toelichting (optioneel)</Label>
          <Textarea id="description" name="description" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="priority">Prioriteit</Label>
            <Select id="priority" name="priority" defaultValue="MIDDEL">
              <option value="LAAG">Laag</option>
              <option value="MIDDEL">Middel</option>
              <option value="HOOG">Hoog</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="dueDate">Deadline</Label>
            <Input id="dueDate" name="dueDate" type="date" />
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
