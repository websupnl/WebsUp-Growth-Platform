import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { AuditStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusTone: Record<AuditStatus, "orange" | "violet" | "green" | "neutral"> = {
  AANGEVRAAGD: "orange",
  GEANALYSEERD: "violet",
  RAPPORT_KLAAR: "green",
  VERSTUURD: "neutral",
};

export default async function AuditsPage() {
  const audits = await db.websiteAudit.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { company: true } } },
  });

  const open = audits.filter((a) => a.status !== "VERSTUURD");
  const sent = audits.filter((a) => a.status === "VERSTUURD");

  return (
    <div>
      <PageHeader
        title="Website Verbeterplan"
        description="Aanvragen van de publieke landingspagina. Start de AI-analyse en volg op."
      />

      {audits.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog geen aanvragen. Deel de link{" "}
            <code className="rounded bg-surface px-1 text-brand-violet">/verbeterplan</code>{" "}
            op je website of LinkedIn om aanvragen te ontvangen.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-3">
            {open.map((audit) => (
              <Link key={audit.id} href={`/audits/${audit.id}`}>
                <Card className="transition-colors hover:border-brand-violet/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-semibold text-white">
                        {audit.url}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted">
                        {audit.requesterName
                          ? `${audit.requesterName} · ${audit.requesterEmail}`
                          : audit.requesterEmail}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone[audit.status]}>
                          {audit.status.toLowerCase().replace("_", " ")}
                        </Badge>
                        {audit.lead && (
                          <Badge tone="green">lead: {audit.lead.company}</Badge>
                        )}
                        {audit.analysis && (
                          <Badge tone="violet">
                            score {(audit.analysis as { score?: number }).score ?? "?"}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-muted">
                      {formatDate(audit.createdAt)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {sent.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted">
                Verstuurd
              </h2>
              <div className="grid gap-2">
                {sent.map((audit) => (
                  <Link key={audit.id} href={`/audits/${audit.id}`}>
                    <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-2 opacity-60 transition-opacity hover:opacity-100">
                      <span className="text-white">{audit.url}</span>
                      <span className="text-sm text-muted">{formatDate(audit.createdAt)}</span>
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
