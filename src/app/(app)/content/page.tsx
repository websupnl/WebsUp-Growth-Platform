import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { SocialType, ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const typeName: Record<SocialType, string> = {
  LINKEDIN_CASE: "LinkedIn case",
  LINKEDIN_SHORT: "LinkedIn kort",
  INSTAGRAM_CAROUSEL: "Instagram carousel",
  REEL_SCRIPT: "Reels script",
  TIKTOK_HOOK: "TikTok hook",
  STORY: "Story reeks",
};

const statusTone: Record<ContentStatus, "neutral" | "orange" | "green"> = {
  CONCEPT: "neutral",
  KLAAR: "orange",
  GEPUBLICEERD: "green",
};

async function setStatus(id: string, status: ContentStatus) {
  "use server";
  await db.socialContent.update({ where: { id }, data: { status } });
  revalidatePath("/content");
}

export default async function ContentPage() {
  const items = await db.socialContent.findMany({
    orderBy: { createdAt: "desc" },
    include: { case: { select: { id: true, title: true } } },
  });

  const grouped = items.reduce<Record<ContentStatus, typeof items>>(
    (acc, item) => {
      acc[item.status].push(item);
      return acc;
    },
    { CONCEPT: [], KLAAR: [], GEPUBLICEERD: [] }
  );

  return (
    <div>
      <PageHeader
        title="Social Content"
        description="Alles wat gegenereerd is vanuit je cases. Klaar om te verfijnen en te publiceren."
      />

      {items.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nog geen content. Ga naar een case en klik op &quot;Genereer&quot; om te beginnen.
          </p>
        </Card>
      ) : (
        <div className="grid gap-8">
          {(["CONCEPT", "KLAAR", "GEPUBLICEERD"] as ContentStatus[]).map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted">
                  {status.toLowerCase()} ({group.length})
                </h2>
                <div className="grid gap-3">
                  {group.map((sc) => (
                    <Card key={sc.id}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="violet">{typeName[sc.type]}</Badge>
                          <Badge tone={statusTone[sc.status]}>{sc.status.toLowerCase()}</Badge>
                          {sc.case && (
                            <Link href={`/cases/${sc.case.id}`}>
                              <Badge tone="neutral" className="hover:border-brand-violet/50 cursor-pointer">
                                {sc.case.title}
                              </Badge>
                            </Link>
                          )}
                        </div>
                        <span className="text-sm text-muted">{formatDate(sc.createdAt)}</span>
                      </div>

                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-body text-sm text-white">
                        {sc.body}
                      </pre>

                      <div className="mt-3 flex gap-2">
                        {status === "CONCEPT" && (
                          <form action={setStatus.bind(null, sc.id, "KLAAR")}>
                            <Button type="submit" variant="secondary" size="sm">Markeer als klaar</Button>
                          </form>
                        )}
                        {status === "KLAAR" && (
                          <form action={setStatus.bind(null, sc.id, "GEPUBLICEERD")}>
                            <Button type="submit" size="sm">Gepubliceerd</Button>
                          </form>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
