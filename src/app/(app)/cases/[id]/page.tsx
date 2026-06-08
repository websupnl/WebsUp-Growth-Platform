import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CaseControls } from "./case-controls";
import { updateCase } from "../actions";
import type { SocialType, ContentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const sections: { key: string; label: string; hint: string }[] = [
  { key: "currentSituation", label: "1. Huidige situatie", hint: "Hoe zag het bedrijf er digitaal uit voor WebsUp?" },
  { key: "whatStoodOut", label: "2. Wat viel op", hint: "Wat zag jij wat de eigenaar zelf niet zag?" },
  { key: "idea", label: "3. Idee", hint: "Welk idee had jij om dit op te lossen?" },
  { key: "solution", label: "4. Oplossing", hint: "Wat is er daadwerkelijk gebouwd of veranderd?" },
  { key: "demo", label: "5. Demo", hint: "Hoe liet je de oplossing zien? Link, screenshot, uitleg." },
  { key: "dashboard", label: "6. Dashboard", hint: "Welk overzicht of dashboard kregen ze erbij?" },
  { key: "workflow", label: "7. Workflow", hint: "Hoe ziet het nieuwe proces eruit? Stap voor stap." },
  { key: "result", label: "8. Resultaat", hint: "Wat is het concrete resultaat? Gebruik cijfers als je ze hebt." },
  { key: "futureVision", label: "9. Toekomstbeeld", hint: "Wat is er nu mogelijk wat daarvoor niet mogelijk was?" },
  { key: "socialProof", label: "10. Social proof", hint: "Quote van de klant, reactie, of andere bevestiging." },
];

const contentTypeName: Record<SocialType, string> = {
  LINKEDIN_CASE: "LinkedIn case",
  LINKEDIN_SHORT: "LinkedIn kort",
  INSTAGRAM_CAROUSEL: "Instagram carousel",
  REEL_SCRIPT: "Reels script",
  TIKTOK_HOOK: "TikTok hook",
  STORY: "Story reeks",
};

const contentStatusTone: Record<ContentStatus, "neutral" | "orange" | "green"> = {
  CONCEPT: "neutral",
  KLAAR: "orange",
  GEPUBLICEERD: "green",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await db.case.findUnique({
    where: { id },
    include: {
      socialContents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!c) notFound();

  return (
    <div>
      <PageHeader title={c.title} description={c.client ?? undefined}>
        <Link href="/cases">
          <Button variant="ghost" size="sm">Terug</Button>
        </Link>
      </PageHeader>

      <CaseControls id={c.id} status={c.status} />

      {/* Bewerkbaar formulier met alle 10 secties */}
      <form action={updateCase.bind(null, id)} className="grid gap-6 mb-8">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={c.title} required />
            </div>
            <div>
              <Label htmlFor="client">Klant</Label>
              <Input id="client" name="client" defaultValue={c.client ?? ""} />
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          {sections.map(({ key, label, hint }) => (
            <Card key={key}>
              <Label htmlFor={key} className="mb-0.5 font-heading text-base font-semibold text-white">
                {label}
              </Label>
              <p className="mb-2 text-sm text-muted">{hint}</p>
              <Textarea
                id={key}
                name={key}
                defaultValue={String((c as Record<string, unknown>)[key] ?? "")}
                className="min-h-28"
              />
            </Card>
          ))}
        </div>

        <div>
          <Button type="submit">Case opslaan</Button>
        </div>
      </form>

      {/* Gegenereerde social content */}
      {c.socialContents.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold text-white">
            Social content ({c.socialContents.length})
          </h2>
          <div className="grid gap-4">
            {c.socialContents.map((sc) => (
              <Card key={sc.id}>
                <div className="mb-3 flex items-center gap-2">
                  <Badge tone="violet">{contentTypeName[sc.type]}</Badge>
                  <Badge tone={contentStatusTone[sc.status]}>{sc.status.toLowerCase()}</Badge>
                </div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-body text-sm text-white">
                  {sc.body}
                </pre>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
