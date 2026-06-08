import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskForm } from "./task-form";
import { setTaskStatus, deleteTask } from "./actions";
import { formatDate } from "@/lib/utils";
import type { TaskStatus, Level } from "@prisma/client";

export const dynamic = "force-dynamic";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "OPEN", label: "Open" },
  { status: "BEZIG", label: "Bezig" },
  { status: "WACHT", label: "Wacht" },
  { status: "KLAAR", label: "Klaar" },
];

const next: Record<TaskStatus, TaskStatus> = {
  OPEN: "BEZIG",
  BEZIG: "KLAAR",
  WACHT: "BEZIG",
  KLAAR: "OPEN",
};

const prioTone: Record<Level, "neutral" | "orange" | "red"> = {
  LAAG: "neutral",
  MIDDEL: "orange",
  HOOG: "red",
};

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { idea: { select: { title: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Taken"
        description="Alles wat moet gebeuren, gekoppeld aan ideeën, leads, cases en doelen."
      />

      <TaskForm />

      {tasks.length === 0 ? (
        <Card>
          <p className="text-muted">Geen taken. Voeg je eerste actie toe.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {columns.map((col) => {
            const group = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status}>
                <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted">
                  {col.label}
                  <span className="text-muted/60">{group.length}</span>
                </h2>
                <div className="grid gap-2">
                  {group.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={
                              task.status === "KLAAR"
                                ? "text-muted line-through"
                                : "font-medium text-white"
                            }
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-0.5 text-sm text-muted">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge tone={prioTone[task.priority]}>
                              {task.priority.toLowerCase()}
                            </Badge>
                            {task.dueDate && (
                              <Badge tone="neutral">{formatDate(task.dueDate)}</Badge>
                            )}
                            {task.idea && <Badge tone="violet">{task.idea.title}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <form action={setTaskStatus.bind(null, task.id, next[task.status])}>
                          <Button type="submit" variant="secondary" size="sm">
                            → {next[task.status].toLowerCase()}
                          </Button>
                        </form>
                        <form action={deleteTask.bind(null, task.id)}>
                          <Button type="submit" variant="ghost" size="sm">
                            Verwijder
                          </Button>
                        </form>
                      </div>
                    </Card>
                  ))}
                  {group.length === 0 && (
                    <p className="rounded-xl border border-dashed border-surface-border px-3 py-4 text-center text-sm text-muted/60">
                      leeg
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
