import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { formatDate, relativeDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [goal, openTasks, ideas, leadsToFollow, recentIdeas, memoryCount] =
    await Promise.all([
      db.goal.findFirst({ where: { isPrimary: true } }),
      db.task.count({ where: { status: { not: "KLAAR" } } }),
      db.idea.count({ where: { status: "NIEUW" } }),
      db.lead.findMany({
        where: { status: { notIn: ["KLANT", "VERLOREN"] }, nextActionAt: { not: null } },
        orderBy: { nextActionAt: "asc" },
        take: 5,
      }),
      db.idea.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.knowledgeItem.count({ where: { active: true } }),
    ]);

  const target = goal?.target ?? 10;
  const current = goal?.current ?? 0;
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      <PageHeader
        title="Goedemorgen, Daan"
        description="Het besturingssysteem van WebsUp. Eén plek voor alles."
      />

      {/* Road to 10 clients */}
      <Card className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <CardTitle>Road to 10 clients</CardTitle>
            <p className="mt-1 text-muted">
              {current} van {target} klanten binnen
              {goal?.deadline ? ` · deadline ${formatDate(goal.deadline)}` : ""}
            </p>
          </div>
          <span className="font-heading text-3xl font-bold text-white">
            {pct}%
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      {/* Snelle stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Open taken" value={openTasks} href="/tasks" />
        <StatCard label="Nieuwe ideeën" value={ideas} href="/ideas" />
        <StatCard label="Leads in pijplijn" value={leadsToFollow.length} href="/leads" />
        <StatCard label="Memory-items" value={memoryCount} href="/memory" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Opvolging */}
        <Card>
          <CardTitle className="mb-3">Leads die opvolging nodig hebben</CardTitle>
          {leadsToFollow.length === 0 ? (
            <Empty text="Nog geen leads ingepland. Voeg ze toe in de Lead CRM." />
          ) : (
            <ul className="space-y-2">
              {leadsToFollow.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-white">{l.company}</p>
                    <p className="text-sm text-muted">{l.nextAction}</p>
                  </div>
                  <Badge tone="orange">{relativeDays(l.nextActionAt)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Nieuwe ideeën */}
        <Card>
          <CardTitle className="mb-3">Laatste ideeën</CardTitle>
          {recentIdeas.length === 0 ? (
            <Empty text="Nog geen ideeën. Gooi je eerste in de inbox." />
          ) : (
            <ul className="space-y-2">
              {recentIdeas.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-3 py-2"
                >
                  <p className="font-medium text-white">{i.title}</p>
                  <Badge tone="violet">{i.status.toLowerCase()}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-brand-violet/50">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold text-white">{value}</p>
      </Card>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}
