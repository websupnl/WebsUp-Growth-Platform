import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IdeaForm } from "./idea-form";
import { StatusSelect } from "./status-select";
import { deleteIdea, aiScoreIdea } from "./actions";
import type { Level } from "@prisma/client";

export const dynamic = "force-dynamic";

const levelTone: Record<Level, "neutral" | "orange" | "green"> = {
  LAAG: "neutral",
  MIDDEL: "orange",
  HOOG: "green",
};

export default async function IdeasPage() {
  const ideas = await db.idea.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Ideeën Inbox"
        description="Vang je constante stroom aan ideeën. Laat de AI impact en taken inschatten."
      />

      <IdeaForm />

      {ideas.length === 0 ? (
        <Card>
          <p className="text-muted">Nog geen ideeën. Gooi je eerste idee erin.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {ideas.map((idea) => (
            <Card key={idea.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {idea.title}
                  </h3>
                  {idea.description && (
                    <p className="mt-1 text-muted">{idea.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={levelTone[idea.impact]}>impact {idea.impact.toLowerCase()}</Badge>
                    <Badge tone={levelTone[idea.effort]}>moeite {idea.effort.toLowerCase()}</Badge>
                    <Badge tone={levelTone[idea.urgency]}>urgentie {idea.urgency.toLowerCase()}</Badge>
                    {idea.category && <Badge tone="violet">{idea.category}</Badge>}
                    {idea._count.tasks > 0 && (
                      <Badge tone="pink">{idea._count.tasks} taken</Badge>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <StatusSelect id={idea.id} current={idea.status} />
                  <form action={aiScoreIdea.bind(null, idea.id)}>
                    <Button type="submit" variant="secondary" size="sm" className="w-full">
                      AI inschatting
                    </Button>
                  </form>
                  <form action={deleteIdea.bind(null, idea.id)}>
                    <Button type="submit" variant="danger" size="sm" className="w-full">
                      Verwijderen
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
