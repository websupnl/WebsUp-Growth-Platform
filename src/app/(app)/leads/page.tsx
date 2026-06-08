import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusTone: Record<LeadStatus, "neutral" | "orange" | "pink" | "violet" | "green" | "red"> = {
  NIEUW: "neutral",
  GEKWALIFICEERD: "orange",
  BENADERD: "violet",
  GESPREK: "pink",
  OFFERTE: "orange",
  KLANT: "green",
  VERLOREN: "red",
};

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: [{ status: "asc" }, { nextActionAt: "asc" }, { createdAt: "desc" }],
  });

  const pipeline = leads.filter((l) => !["KLANT", "VERLOREN"].includes(l.status));
  const closed = leads.filter((l) => ["KLANT", "VERLOREN"].includes(l.status));

  return (
    <div>
      <PageHeader
        title="Lead CRM"
        description="Persoonlijke observaties per bedrijf. Niet voor spam, maar voor de juiste aanpak."
      >
        <Link href="/leads/nieuw">
          <Button>Nieuwe lead</Button>
        </Link>
      </PageHeader>

      {leads.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog geen leads. Voeg je eerste bedrijf toe en noteer wat je opvalt.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-3">
            {pipeline.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <Card className="transition-colors hover:border-brand-violet/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-white">
                          {lead.company}
                        </h3>
                        <Badge tone={statusTone[lead.status]}>
                          {lead.status.toLowerCase()}
                        </Badge>
                      </div>
                      {lead.website && (
                        <p className="text-sm text-muted">{lead.website}</p>
                      )}
                      {lead.problemObserved && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted">
                          {lead.problemObserved}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {lead.nextAction && (
                          <Badge tone="orange">
                            {lead.nextAction}
                            {lead.nextActionAt ? ` · ${formatDate(lead.nextActionAt)}` : ""}
                          </Badge>
                        )}
                        <Badge tone="neutral">kans {lead.score}%</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {closed.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted">
                Afgerond
              </h2>
              <div className="grid gap-2">
                {closed.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
                      <span className="font-medium text-white">{lead.company}</span>
                      <Badge tone={statusTone[lead.status]}>{lead.status.toLowerCase()}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
