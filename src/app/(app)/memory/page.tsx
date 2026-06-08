import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemoryForm } from "./memory-form";
import { toggleActive, deleteMemory } from "./actions";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  MEMORY: "Memory",
  INSIGHT: "Inzicht",
  STRATEGY: "Strategie",
  PROCESS: "Proces",
  LESSON: "Les",
  DECISION: "Beslissing",
};

export default async function MemoryPage() {
  const items = await db.knowledgeItem.findMany({
    orderBy: [{ active: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Memory Engine"
        description="De centrale kennisbank. Actieve items voeden automatisch elke AI-actie."
      />

      <MemoryForm />

      {items.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog geen kennis opgeslagen. Begin met je belangrijkste principe, bijvoorbeeld
            &quot;WebsUp verkoopt oplossingen, geen websites&quot;.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={item.active ? "" : "opacity-50"}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="violet">{typeLabels[item.type] ?? item.type}</Badge>
                    <Badge tone="neutral">prioriteit {item.priority}</Badge>
                    {!item.active && <Badge tone="neutral">inactief</Badge>}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-muted">{item.body}</p>
                  {item.tags.length > 0 && (
                    <p className="mt-2 text-sm text-muted/70">
                      {item.tags.map((t) => `#${t}`).join("  ")}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <form action={toggleActive.bind(null, item.id, !item.active)}>
                    <Button type="submit" variant="secondary" size="sm">
                      {item.active ? "Deactiveren" : "Activeren"}
                    </Button>
                  </form>
                  <form action={deleteMemory.bind(null, item.id)}>
                    <Button type="submit" variant="danger" size="sm">
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
