import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RunAuditButton } from "./audit-buttons";
import { runAudit, setAuditStatus, linkLeadToAudit } from "../actions";
import { formatDate } from "@/lib/utils";
import type { AuditResult } from "@/lib/ai/audit";
import type { AuditStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const impactTone: Record<string, "neutral" | "orange" | "red"> = {
  LAAG: "neutral",
  MIDDEL: "orange",
  HOOG: "red",
};

const nextStatus: Partial<Record<AuditStatus, AuditStatus>> = {
  GEANALYSEERD: "RAPPORT_KLAAR",
  RAPPORT_KLAAR: "VERSTUURD",
};

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await db.websiteAudit.findUnique({
    where: { id },
    include: { lead: { select: { id: true, company: true } } },
  });
  if (!audit) notFound();

  const analysis = audit.analysis as AuditResult | null;

  return (
    <div>
      <PageHeader title={audit.url} description={`Aangevraagd op ${formatDate(audit.createdAt)}`}>
        <Link href="/audits">
          <Button variant="ghost" size="sm">Terug</Button>
        </Link>
      </PageHeader>

      {/* Aanvrager */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Aanvrager</p>
            <p className="font-medium text-white">
              {audit.requesterName
                ? `${audit.requesterName} · ${audit.requesterEmail}`
                : audit.requesterEmail ?? "Onbekend"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                audit.status === "VERSTUURD"
                  ? "neutral"
                  : audit.status === "RAPPORT_KLAAR"
                  ? "green"
                  : audit.status === "GEANALYSEERD"
                  ? "violet"
                  : "orange"
              }
            >
              {audit.status.toLowerCase().replace("_", " ")}
            </Badge>
            {nextStatus[audit.status] && (
              <form action={setAuditStatus.bind(null, id, nextStatus[audit.status]!)}>
                <Button type="submit" variant="secondary" size="sm">
                  Markeer als {nextStatus[audit.status]!.toLowerCase().replace("_", " ")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Card>

      {/* Lead koppelen */}
      {!audit.lead ? (
        <Card className="mb-6">
          <CardTitle className="mb-3">Koppelen aan lead</CardTitle>
          <form action={linkLeadToAudit.bind(null, id)} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="company">Bedrijfsnaam</Label>
              <Input
                id="company"
                name="company"
                placeholder={audit.requesterName ?? "Naam van het bedrijf"}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="secondary">Lead aanmaken</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Gekoppelde lead</p>
              <p className="font-medium text-white">{audit.lead.company}</p>
            </div>
            <Link href={`/leads/${audit.lead.id}`}>
              <Button variant="secondary" size="sm">Open lead</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* AI-analyse starten */}
      {!analysis && (
        <Card className="mb-6">
          <p className="mb-4 text-muted">
            De AI haalt de website op, analyseert de inhoud en maakt een persoonlijk
            verbeterplan. Na de analyse wordt automatisch een opvolgingstaak aangemaakt.
          </p>
          <form action={runAudit.bind(null, id)}>
            <RunAuditButton />
          </form>
        </Card>
      )}

      {/* Rapport */}
      {analysis && (
        <div className="grid gap-6">
          {/* Samenvatting + score */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="mb-2">Samenvatting</CardTitle>
                <p className="text-white">{analysis.summary}</p>
              </div>
              <div className="shrink-0 text-center">
                <p className="font-heading text-4xl font-bold text-white">{analysis.score}</p>
                <p className="text-sm text-muted">/ 100</p>
              </div>
            </div>
          </Card>

          {/* Verbeterpunten */}
          <Card>
            <CardTitle className="mb-4">Verbeterpunten</CardTitle>
            <div className="grid gap-4">
              {analysis.improvements.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-surface-border bg-surface p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{item.category}</Badge>
                    <Badge tone={impactTone[item.impact]}>impact {item.impact.toLowerCase()}</Badge>
                  </div>
                  <h4 className="font-heading font-semibold text-white">{item.title}</h4>
                  <p className="mt-1 text-sm text-muted">{item.problem}</p>
                  <p className="mt-2 text-sm text-white">{item.suggestion}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick wins */}
          {analysis.quickWins?.length > 0 && (
            <Card>
              <CardTitle className="mb-3">Direct doen</CardTitle>
              <ul className="space-y-2">
                {analysis.quickWins.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-white">
                    <span className="mt-0.5 text-brand-violet">+</span>
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* WebsUp fit */}
          <Card className="border-brand-violet/30">
            <CardTitle className="mb-2">Hoe WebsUp kan helpen</CardTitle>
            <p className="text-white">{analysis.websupFit}</p>
          </Card>

          {/* Opnieuw analyseren */}
          <div>
            <form action={runAudit.bind(null, id)}>
              <RunAuditButton />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
