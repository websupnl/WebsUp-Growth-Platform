import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportForm } from "./import-form";
import { formatDate } from "@/lib/utils";
import type { ImportStatus, ImportSource } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusTone: Record<ImportStatus, "neutral" | "orange" | "violet" | "green"> = {
  PENDING: "orange",
  ANALYZED: "violet",
  APPLIED: "green",
};

const statusLabel: Record<ImportStatus, string> = {
  PENDING: "nog niet geanalyseerd",
  ANALYZED: "voorstellen klaar",
  APPLIED: "verwerkt",
};

const sourceLabel: Record<ImportSource, string> = {
  CHATGPT: "ChatGPT",
  CLAUDE: "Claude",
  CODEX: "Codex",
  NOTES: "Notitie",
  OTHER: "Anders",
};

export default async function ImportPage() {
  const imports = await db.chatImport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { extractions: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Chat Import"
        description="Je belangrijkste invoer. Plak een gesprek, AI haalt er voorstellen uit, jij keurt goed."
      />

      <ImportForm />

      {imports.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog niets geïmporteerd. Plak je eerste ChatGPT- of Claude-gesprek en kijk wat
            eruit komt.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {imports.map((imp) => (
            <Link key={imp.id} href={`/import/${imp.id}`}>
              <Card className="transition-colors hover:border-brand-violet/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-white">
                      {imp.title || "Naamloos gesprek"}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {imp.rawContent.slice(0, 180)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{sourceLabel[imp.source]}</Badge>
                      <Badge tone={statusTone[imp.status]}>{statusLabel[imp.status]}</Badge>
                      {imp._count.extractions > 0 && (
                        <Badge tone="pink">{imp._count.extractions} voorstellen</Badge>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm text-muted">
                    {formatDate(imp.createdAt)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
