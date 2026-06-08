"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { setCaseStatus, deleteCase, aiSuggestCase, generateContent } from "../actions";
import type { CaseStatus, SocialType } from "@prisma/client";

const statuses: CaseStatus[] = ["CONCEPT", "ACTIEF", "GEPUBLICEERD"];

const contentTypes: { value: SocialType; label: string }[] = [
  { value: "LINKEDIN_CASE", label: "LinkedIn case study" },
  { value: "LINKEDIN_SHORT", label: "LinkedIn korte post" },
  { value: "INSTAGRAM_CAROUSEL", label: "Instagram carousel" },
  { value: "REEL_SCRIPT", label: "Reels script" },
  { value: "TIKTOK_HOOK", label: "TikTok hooks" },
  { value: "STORY", label: "Story reeks" },
];

function AISuggestButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "AI werkt aan de structuur..." : "AI structuur voorstellen"}
    </Button>
  );
}

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Content wordt gemaakt..." : "Genereer"}
    </Button>
  );
}

export function CaseControls({ id, status }: { id: string; status: CaseStatus }) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      {/* Status + verwijderen */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          action={async (fd) => {
            await setCaseStatus(id, fd.get("status") as CaseStatus);
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

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNotes((v) => !v)}
        >
          {showNotes ? "Verberg AI-assistent" : "AI structuur invullen"}
        </Button>

        <form
          action={deleteCase.bind(null, id)}
          onSubmit={(e) => {
            if (!confirm("Case verwijderen?")) e.preventDefault();
          }}
        >
          <Button type="submit" variant="danger" size="sm">
            Verwijderen
          </Button>
        </form>
      </div>

      {/* AI structuur assistent */}
      {showNotes && (
        <Card>
          <CardTitle className="mb-3">AI structuur assistent</CardTitle>
          <p className="mb-3 text-sm text-muted">
            Plak je ruwe notities over deze case. De AI vult de 6 kernsecties voor je in.
            Je kunt daarna alles aanpassen.
          </p>
          <form action={aiSuggestCase.bind(null, id)} className="grid gap-3">
            <div>
              <Label htmlFor="rawNotes">Ruwe notities</Label>
              <Textarea
                id="rawNotes"
                name="rawNotes"
                className="min-h-40 font-mono text-sm"
                placeholder="Wat weet je over deze case? Klantprobleem, wat je zag, wat je gebouwd hebt, resultaat..."
                required
              />
            </div>
            <AISuggestButton />
          </form>
        </Card>
      )}

      {/* Social content genereren */}
      <Card>
        <CardTitle className="mb-3">Social content genereren</CardTitle>
        <form action={generateContent.bind(null, id)} className="flex flex-wrap gap-3">
          <Select name="type" defaultValue="LINKEDIN_SHORT" className="h-9 text-sm flex-1 min-w-48">
            {contentTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </Select>
          <GenerateButton />
        </form>
      </Card>
    </div>
  );
}
