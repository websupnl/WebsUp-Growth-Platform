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
import { LeadActionsBar } from "./lead-actions-bar";
import { updateLead } from "../actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) notFound();

  const analysis = lead.websiteAnalysis as Record<string, string> | null;
  const outreach = lead.outreach as Record<string, string> | null;

  return (
    <div>
      <PageHeader title={lead.company} description={lead.website ?? undefined}>
        <Link href="/leads">
          <Button variant="ghost" size="sm">Terug</Button>
        </Link>
      </PageHeader>

      <LeadActionsBar id={lead.id} status={lead.status} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bewerkbaar formulier */}
        <Card className="md:col-span-2">
          <CardTitle className="mb-4">Details</CardTitle>
          <form action={updateLead.bind(null, lead.id)} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company">Bedrijf</Label>
                <Input id="company" name="company" defaultValue={lead.company} required />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={lead.website ?? ""} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactPerson">Contactpersoon</Label>
                <Input id="contactPerson" name="contactPerson" defaultValue={lead.contactPerson ?? ""} />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" defaultValue={lead.email ?? ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="problemObserved">Probleem dat ik zie</Label>
              <Textarea id="problemObserved" name="problemObserved" defaultValue={lead.problemObserved ?? ""} />
            </div>
            <div>
              <Label htmlFor="possibleSolution">Mogelijke oplossing</Label>
              <Textarea id="possibleSolution" name="possibleSolution" defaultValue={lead.possibleSolution ?? ""} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="nextAction">Volgende actie</Label>
                <Input id="nextAction" name="nextAction" defaultValue={lead.nextAction ?? ""} />
              </div>
              <div>
                <Label htmlFor="nextActionAt">Datum</Label>
                <Input
                  id="nextActionAt"
                  name="nextActionAt"
                  type="date"
                  defaultValue={
                    lead.nextActionAt ? lead.nextActionAt.toISOString().split("T")[0] : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor="score">Kansscore (0-100)</Label>
                <Input id="score" name="score" type="number" min={0} max={100} defaultValue={lead.score} />
              </div>
            </div>
            <div>
              <Button type="submit" variant="secondary">Opslaan</Button>
            </div>
          </form>
        </Card>

        {/* AI-analyse */}
        {analysis && (
          <Card>
            <CardTitle className="mb-3">AI-analyse</CardTitle>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted">Huidige situatie</p>
                <p className="mt-0.5 text-white">{analysis.currentSituation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Gemiste kans</p>
                <p className="mt-0.5 text-white">{analysis.missedOpportunity}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="violet">fit {analysis.fitScore}%</Badge>
                <span className="text-sm text-muted">{analysis.fitReason}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Benaderings-concept */}
        {outreach && (
          <Card>
            <CardTitle className="mb-3">Benadering</CardTitle>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-muted">E-mail onderwerp</p>
                <p className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-white">
                  {outreach.emailSubject}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted">E-mail</p>
                <pre className="whitespace-pre-wrap rounded-lg border border-surface-border bg-surface px-3 py-2 font-body text-sm text-white">
                  {outreach.emailBody}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted">LinkedIn DM</p>
                <pre className="whitespace-pre-wrap rounded-lg border border-surface-border bg-surface px-3 py-2 font-body text-sm text-white">
                  {outreach.linkedinMessage}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* Gekoppelde taken */}
        {lead.tasks.length > 0 && (
          <Card>
            <CardTitle className="mb-3">Taken</CardTitle>
            <ul className="space-y-2">
              {lead.tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <Badge tone={t.status === "KLAAR" ? "green" : "neutral"}>
                    {t.status.toLowerCase()}
                  </Badge>
                  <span className={t.status === "KLAAR" ? "line-through text-muted" : "text-white"}>
                    {t.title}
                  </span>
                  {t.dueDate && (
                    <span className="ml-auto text-sm text-muted">{formatDate(t.dueDate)}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Tijdlijn */}
        <Card>
          <CardTitle className="mb-3">Tijdlijn</CardTitle>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Aangemaakt</dt>
              <dd className="text-white">{formatDate(lead.createdAt)}</dd>
            </div>
            {lead.lastContactAt && (
              <div className="flex justify-between">
                <dt className="text-muted">Laatste contact</dt>
                <dd className="text-white">{formatDate(lead.lastContactAt)}</dd>
              </div>
            )}
            {lead.source && (
              <div className="flex justify-between">
                <dt className="text-muted">Bron</dt>
                <dd className="text-white">{lead.source}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
