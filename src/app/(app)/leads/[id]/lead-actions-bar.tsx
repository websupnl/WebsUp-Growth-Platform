"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { setLeadStatus, deleteLead, aiAnalyseLead } from "../actions";
import type { LeadStatus } from "@prisma/client";

const statuses: LeadStatus[] = [
  "NIEUW",
  "GEKWALIFICEERD",
  "BENADERD",
  "GESPREK",
  "OFFERTE",
  "KLANT",
  "VERLOREN",
];

function AIButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "AI analyseert..." : "AI analyse + benadering"}
    </Button>
  );
}

export function LeadActionsBar({ id, status }: { id: string; status: LeadStatus }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <form
        action={async (fd) => {
          await setLeadStatus(id, fd.get("status") as LeadStatus);
        }}
        className="flex items-center gap-2"
      >
        <Select
          name="status"
          defaultValue={status}
          className="h-9 text-sm"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase()}
            </option>
          ))}
        </Select>
      </form>

      <form action={aiAnalyseLead.bind(null, id)}>
        <AIButton />
      </form>

      <form
        action={deleteLead.bind(null, id)}
        onSubmit={(e) => {
          if (!confirm("Lead verwijderen? Dit kan niet ongedaan worden.")) e.preventDefault();
        }}
      >
        <Button type="submit" variant="danger" size="sm">
          Verwijderen
        </Button>
      </form>
    </div>
  );
}
