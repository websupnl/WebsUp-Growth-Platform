import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate, relativeDays } from "@/lib/utils";
import {
  ArrowRight,
  AlertCircle,
  Inbox,
  Lightbulb,
  CheckSquare,
  Gauge,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();

  const [goal, urgentLeads, pendingImports, pendingAudits, openTasks, newIdeas] =
    await Promise.all([
      db.goal.findFirst({ where: { isPrimary: true } }),
      // Leads die opvolging nodig hebben (gesorteerd op datum, meest urgent eerst)
      db.lead.findMany({
        where: {
          status: { notIn: ["KLANT", "VERLOREN"] },
          nextActionAt: { not: null },
        },
        orderBy: { nextActionAt: "asc" },
        take: 6,
      }),
      // Imports die nog niet geanalyseerd zijn
      db.chatImport.count({ where: { status: "PENDING" } }),
      // Audits die wachten op actie
      db.websiteAudit.findMany({
        where: { status: { in: ["AANGEVRAAGD", "GEANALYSEERD"] } },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      // Open taken (meest urgent)
      db.task.findMany({
        where: { status: { not: "KLAAR" } },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 5,
        include: { idea: { select: { title: true } }, lead: { select: { company: true } } },
      }),
      // Nieuwe ideeën
      db.idea.count({ where: { status: "NIEUW" } }),
    ]);

  const target = goal?.target ?? 10;
  const current = goal?.current ?? 0;
  const pct = Math.min(100, Math.round((current / target) * 100));

  // Leads die vandaag of in het verleden actie nodig hebben
  const overdueLeads = urgentLeads.filter(
    (l) => l.nextActionAt && l.nextActionAt <= now
  );
  const upcomingLeads = urgentLeads.filter(
    (l) => l.nextActionAt && l.nextActionAt > now
  );

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Goedemorgen";
    if (h < 18) return "Goedemiddag";
    return "Goedenavond";
  })();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {greeting}, Daan
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {/* Snelle acties */}
        <div className="flex gap-2">
          <Link
            href="/import"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white hover:bg-white/[0.08]"
          >
            <Inbox className="h-3.5 w-3.5" /> Chat plakken
          </Link>
          <Link
            href="/leads/nieuw"
            className="flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/20 hover:opacity-90 transition-opacity"
          >
            + Nieuwe lead
          </Link>
        </div>
      </div>

      {/* Road to 10 clients — groot en prominent */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/5 via-transparent to-[#a78bfa]/5" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Road to 10 clients
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-bold text-white">{current}</span>
                <span className="font-heading text-2xl text-white/30">/ {target}</span>
              </div>
              <p className="mt-1 text-sm text-white/40">
                {target - current} klanten te gaan
                {goal?.deadline ? ` · deadline ${formatDate(goal.deadline)}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span className="font-heading text-4xl font-bold text-transparent bg-brand-gradient bg-clip-text">
                {pct}%
              </span>
            </div>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-700"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Attentie-blokken als er iets urgent is */}
      {(overdueLeads.length > 0 || pendingImports > 0 || pendingAudits.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {overdueLeads.length > 0 && (
            <Link href="/leads">
              <div className="flex items-center gap-3 rounded-xl border border-[#f97316]/20 bg-[#f97316]/5 px-4 py-3 transition-colors hover:border-[#f97316]/40">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#fb923c]" />
                <div>
                  <p className="text-sm font-medium text-white">{overdueLeads.length} lead{overdueLeads.length > 1 ? "s" : ""} wacht op actie</p>
                  <p className="text-xs text-white/40">Datum verstreken</p>
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/20" />
              </div>
            </Link>
          )}
          {pendingImports > 0 && (
            <Link href="/import">
              <div className="flex items-center gap-3 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5 px-4 py-3 transition-colors hover:border-[#a78bfa]/40">
                <Inbox className="h-4 w-4 shrink-0 text-[#c4b5fd]" />
                <div>
                  <p className="text-sm font-medium text-white">{pendingImports} import{pendingImports > 1 ? "s" : ""} wacht</p>
                  <p className="text-xs text-white/40">Nog niet geanalyseerd</p>
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/20" />
              </div>
            </Link>
          )}
          {pendingAudits.length > 0 && (
            <Link href="/audits">
              <div className="flex items-center gap-3 rounded-xl border border-[#ec4899]/20 bg-[#ec4899]/5 px-4 py-3 transition-colors hover:border-[#ec4899]/40">
                <Gauge className="h-4 w-4 shrink-0 text-[#f472b6]" />
                <div>
                  <p className="text-sm font-medium text-white">{pendingAudits.length} verbeterplan{pendingAudits.length > 1 ? "nen" : ""}</p>
                  <p className="text-xs text-white/40">Aangevraagd, wacht op analyse</p>
                </div>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/20" />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Twee kolommen: leads + taken */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Leads opvolging */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white/80">Leads opvolging</p>
            <Link href="/leads" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Alle leads <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {urgentLeads.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-white/25">Geen leads gepland.</p>
              <Link href="/leads/nieuw" className="mt-2 inline-block text-xs text-[#c4b5fd] hover:text-white/80 transition-colors">
                Voeg je eerste lead toe
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {urgentLeads.map((lead) => {
                const isOverdue = lead.nextActionAt && lead.nextActionAt <= now;
                return (
                  <li key={lead.id}>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lead.company}</p>
                        {lead.nextAction && (
                          <p className="text-xs text-white/40 truncate">{lead.nextAction}</p>
                        )}
                      </div>
                      <Badge tone={isOverdue ? "red" : "orange"} className="shrink-0">
                        {relativeDays(lead.nextActionAt)}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Open taken */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <p className="text-sm font-semibold text-white/80">Open taken</p>
            <Link href="/tasks" className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Alle taken <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {openTasks.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-white/25">Geen open taken.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {openTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href="/tasks"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <CheckSquare className={`h-3.5 w-3.5 shrink-0 ${task.status === "BEZIG" ? "text-[#fb923c]" : "text-white/20"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{task.title}</p>
                      <p className="text-xs text-white/30">
                        {task.idea?.title ?? task.lead?.company ?? task.status.toLowerCase()}
                        {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
                      </p>
                    </div>
                    {task.priority === "HOOG" && (
                      <Badge tone="orange" className="shrink-0">urgent</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Onderaan: kleine stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Nieuwe ideeën" value={newIdeas} icon={<Lightbulb className="h-3.5 w-3.5" />} href="/ideas" tone="violet" />
        <MiniStat label="Audits open" value={pendingAudits.length} icon={<Gauge className="h-3.5 w-3.5" />} href="/audits" tone="pink" />
        <MiniStat label="Niet geanalyseerd" value={pendingImports} icon={<Inbox className="h-3.5 w-3.5" />} href="/import" tone="neutral" />
        <MiniStat label="Leads actief" value={urgentLeads.length} icon={<AlertCircle className="h-3.5 w-3.5" />} href="/leads" tone="orange" />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  href,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  tone: "violet" | "orange" | "pink" | "neutral";
}) {
  const colors = {
    violet: "text-[#c4b5fd]",
    orange: "text-[#fb923c]",
    pink: "text-[#f472b6]",
    neutral: "text-white/30",
  };
  return (
    <Link href={href}>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.05] transition-colors">
        <div className={`mb-2 ${colors[tone]}`}>{icon}</div>
        <p className="font-heading text-xl font-bold text-white">{value}</p>
        <p className="text-[11px] text-white/30">{label}</p>
      </div>
    </Link>
  );
}
