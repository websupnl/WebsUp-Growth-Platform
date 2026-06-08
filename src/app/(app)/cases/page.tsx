import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCase } from "./actions";
import type { CaseStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusTone: Record<CaseStatus, "neutral" | "orange" | "green"> = {
  CONCEPT: "neutral",
  ACTIEF: "orange",
  GEPUBLICEERD: "green",
};

// Hoeveel secties zijn ingevuld (van de 10)
const sections = [
  "currentSituation",
  "whatStoodOut",
  "idea",
  "solution",
  "demo",
  "dashboard",
  "workflow",
  "result",
  "futureVision",
  "socialProof",
] as const;

export default async function CasesPage() {
  const cases = await db.case.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { socialContents: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Case Builder"
        description="Transformatiegericht. Niet wat je bouwde, maar wat er veranderde."
      />

      {/* Nieuwe case aanmaken */}
      <Card className="mb-6">
        <form action={createCase} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="title">Nieuwe case</Label>
            <Input id="title" name="title" placeholder="Bijv. Bouma - Calculatiemodule" required />
          </div>
          <div className="min-w-40">
            <Label htmlFor="client">Klant</Label>
            <Input id="client" name="client" placeholder="Bedrijfsnaam" />
          </div>
          <div className="flex items-end">
            <Button type="submit">Aanmaken</Button>
          </div>
        </form>
      </Card>

      {cases.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog geen cases. Maak je eerste aan, bijv. de Bouma-case als referentie.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => {
            const filled = sections.filter((s) => Boolean((c as Record<string, unknown>)[s])).length;
            return (
              <Link key={c.id} href={`/cases/${c.id}`}>
                <Card className="transition-colors hover:border-brand-violet/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-white">
                          {c.title}
                        </h3>
                        <Badge tone={statusTone[c.status]}>{c.status.toLowerCase()}</Badge>
                      </div>
                      {c.client && <p className="text-sm text-muted">{c.client}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{filled}/10 secties</Badge>
                        {c._count.socialContents > 0 && (
                          <Badge tone="pink">{c._count.socialContents} content</Badge>
                        )}
                      </div>
                    </div>
                    {/* Voortgangsbalk */}
                    <div className="shrink-0 w-24">
                      <div className="h-2 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-brand-gradient"
                          style={{ width: `${(filled / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
