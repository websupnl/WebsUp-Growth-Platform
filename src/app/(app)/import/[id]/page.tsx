import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingButton } from "./buttons";
import {
  analyseImport,
  acceptExtraction,
  rejectExtraction,
  acceptAllProposed,
  deleteImport,
} from "../actions";
import type { ExtractionType } from "@prisma/client";

export const dynamic = "force-dynamic";

const typeMeta: Record<
  ExtractionType,
  { label: string; tone: "orange" | "pink" | "violet" | "green" | "neutral" }
> = {
  IDEA: { label: "Idee", tone: "violet" },
  TASK: { label: "Taak", tone: "orange" },
  MEMORY: { label: "Memory", tone: "pink" },
  STRATEGY: { label: "Strategie", tone: "pink" },
  CASE: { label: "Case", tone: "green" },
  SOCIAL: { label: "Social", tone: "neutral" },
};

const order: ExtractionType[] = ["IDEA", "TASK", "MEMORY", "STRATEGY", "CASE", "SOCIAL"];

function snippet(payload: unknown): string {
  const p = payload as Record<string, unknown>;
  const text = p?.description ?? p?.body ?? p?.solution ?? p?.currentSituation ?? "";
  return String(text).slice(0, 220);
}

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const imp = await db.chatImport.findUnique({
    where: { id },
    include: { extractions: { orderBy: { createdAt: "asc" } } },
  });
  if (!imp) notFound();

  const proposed = imp.extractions.filter((e) => e.status === "PROPOSED");
  const handled = imp.extractions.filter((e) => e.status !== "PROPOSED");

  // Samenvatting per type, "ik heb gevonden: ..."
  const counts = order
    .map((t) => ({ t, n: proposed.filter((e) => e.type === t).length }))
    .filter((c) => c.n > 0);

  return (
    <div>
      <PageHeader
        title={imp.title || "Naamloos gesprek"}
        description={`Bron: ${imp.source.toLowerCase()} · status: ${imp.status.toLowerCase()}`}
      >
        <form action={deleteImport.bind(null, imp.id)}>
          <Button type="submit" variant="danger" size="sm">
            Import verwijderen
          </Button>
        </form>
      </PageHeader>

      {/* Stap 1: analyseren */}
      {imp.status === "PENDING" && (
        <Card className="mb-6">
          <p className="mb-4 text-muted">
            De ruwe chat is bewaard. Laat de AI er nu voorstellen uithalen: ideeën, taken,
            memory, cases en social content. Je keurt daarna zelf goed wat je wilt opslaan.
          </p>
          <form action={analyseImport.bind(null, imp.id)}>
            <PendingButton pendingText="AI analyseert het gesprek...">
              Analyseer met AI
            </PendingButton>
          </form>
        </Card>
      )}

      {/* Stap 2: voorstellen reviewen */}
      {proposed.length > 0 && (
        <Card className="mb-6 border-brand-violet/40">
          <h2 className="font-heading text-lg font-semibold text-white">
            Ik heb gevonden:
          </h2>
          <ul className="mt-2 space-y-1 text-muted">
            {counts.map(({ t, n }) => (
              <li key={t}>
                {n} {typeMeta[t].label.toLowerCase()}
                {n > 1 ? "s" : ""}
              </li>
            ))}
          </ul>
          <form action={acceptAllProposed.bind(null, imp.id)} className="mt-4">
            <PendingButton pendingText="Bezig met opslaan...">
              Alles opslaan ({proposed.length})
            </PendingButton>
          </form>
        </Card>
      )}

      {proposed.length > 0 && (
        <div className="mb-6 grid gap-3">
          {proposed.map((ex) => (
            <Card key={ex.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge tone={typeMeta[ex.type].tone}>{typeMeta[ex.type].label}</Badge>
                  <h3 className="mt-2 font-heading text-base font-semibold text-white">
                    {ex.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{snippet(ex.payload)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <form action={acceptExtraction.bind(null, ex.id)}>
                    <Button type="submit" size="sm" className="w-full">
                      Opslaan
                    </Button>
                  </form>
                  <form action={rejectExtraction.bind(null, ex.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="w-full">
                      Weg
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {imp.status === "ANALYZED" && proposed.length === 0 && handled.length === 0 && (
        <Card className="mb-6">
          <p className="text-muted">
            De AI vond niets om vast te leggen in dit gesprek. Je kunt de import gewoon laten
            staan als archief.
          </p>
        </Card>
      )}

      {/* Verwerkte voorstellen */}
      {handled.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted">
            Verwerkt
          </h2>
          <div className="grid gap-2">
            {handled.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Badge tone="neutral">{typeMeta[ex.type].label}</Badge>
                  {ex.title}
                </span>
                <Badge tone={ex.status === "ACCEPTED" ? "green" : "neutral"}>
                  {ex.status === "ACCEPTED" ? "opgeslagen" : "afgewezen"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ruwe chat blijft altijd bewaard */}
      <details className="rounded-2xl border border-surface-border bg-surface-raised p-5">
        <summary className="cursor-pointer font-heading font-semibold text-white">
          Originele chat
        </summary>
        <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap font-mono text-sm text-muted">
          {imp.rawContent}
        </pre>
      </details>
    </div>
  );
}
