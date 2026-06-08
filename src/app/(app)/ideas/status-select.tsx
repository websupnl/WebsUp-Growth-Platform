"use client";

import { Select } from "@/components/ui/select";
import { setIdeaStatus } from "./actions";
import type { IdeaStatus } from "@prisma/client";

const statuses: IdeaStatus[] = [
  "NIEUW",
  "ONDERZOEKEN",
  "GEPLAND",
  "BOUWEN",
  "AFGEROND",
  "GEPARKEERD",
];

export function StatusSelect({ id, current }: { id: string; current: IdeaStatus }) {
  return (
    <Select
      value={current}
      className="h-8 text-sm"
      onChange={async (e) => {
        await setIdeaStatus(id, e.target.value as IdeaStatus);
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.toLowerCase()}
        </option>
      ))}
    </Select>
  );
}
