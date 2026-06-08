"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { saveChatDump } from "@/lib/files";
import { analyseChat } from "@/lib/ai/workflows";
import type {
  ImportSource,
  Level,
  KnowledgeType,
  SocialType,
  Extraction,
} from "@prisma/client";

const LEVELS = ["LAAG", "MIDDEL", "HOOG"];
const KTYPES = ["MEMORY", "INSIGHT", "STRATEGY", "PROCESS", "LESSON", "DECISION"];
const STYPES = [
  "LINKEDIN_CASE",
  "LINKEDIN_SHORT",
  "INSTAGRAM_CAROUSEL",
  "REEL_SCRIPT",
  "TIKTOK_HOOK",
  "STORY",
];

function level(v: unknown): Level {
  const s = String(v ?? "").toUpperCase();
  return (LEVELS.includes(s) ? s : "MIDDEL") as Level;
}
function ktype(v: unknown): KnowledgeType {
  const s = String(v ?? "").toUpperCase();
  return (KTYPES.includes(s) ? s : "MEMORY") as KnowledgeType;
}
function stype(v: unknown): SocialType {
  const s = String(v ?? "").toUpperCase();
  return (STYPES.includes(s) ? s : "LINKEDIN_SHORT") as SocialType;
}
function prio(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 6;
  return Math.min(10, Math.max(1, Math.round(n)));
}

// Nieuwe chat plakken: ruw bewaren (db + disk), nog niet analyseren.
export async function createImport(formData: FormData) {
  const rawContent = String(formData.get("rawContent") ?? "").trim();
  if (!rawContent) return;

  const imp = await db.chatImport.create({
    data: {
      title: String(formData.get("title") ?? "").trim() || null,
      source: (formData.get("source") as ImportSource) ?? "OTHER",
      rawContent,
      status: "PENDING",
    },
  });

  const filePath = await saveChatDump(imp.id, rawContent);
  if (filePath) {
    await db.chatImport.update({ where: { id: imp.id }, data: { rawFilePath: filePath } });
  }

  redirect(`/import/${imp.id}`);
}

// AI analyseert de chat en zet voorstellen in de staging-tabel.
export async function analyseImport(id: string) {
  const imp = await db.chatImport.findUnique({ where: { id } });
  if (!imp) return;

  const result = await analyseChat(imp.rawContent);

  const rows: {
    type: Extraction["type"];
    title: string;
    payload: object;
  }[] = [];

  for (const i of result.ideas)
    rows.push({ type: "IDEA", title: i.title, payload: i });
  for (const t of result.tasks)
    rows.push({ type: "TASK", title: t.title, payload: t });
  for (const m of result.memory)
    rows.push({
      type: m.type === "STRATEGY" ? "STRATEGY" : "MEMORY",
      title: m.title,
      payload: m,
    });
  for (const c of result.cases)
    rows.push({ type: "CASE", title: c.title, payload: c });
  for (const s of result.social)
    rows.push({ type: "SOCIAL", title: s.title || s.type, payload: s });

  // Oude voorstellen voor deze import opruimen, dan opnieuw vullen.
  await db.$transaction([
    db.extraction.deleteMany({ where: { importId: id, status: "PROPOSED" } }),
    ...rows.map((r) =>
      db.extraction.create({
        data: { importId: id, type: r.type, title: r.title, payload: r.payload },
      })
    ),
    db.chatImport.update({ where: { id }, data: { status: "ANALYZED" } }),
  ]);

  revalidatePath(`/import/${id}`);
}

// Eén voorstel goedkeuren: maak het echte record aan.
export async function acceptExtraction(id: string) {
  const ex = await db.extraction.findUnique({ where: { id } });
  if (!ex || ex.status !== "PROPOSED") return;

  const p = ex.payload as Record<string, unknown>;
  let recordId: string | null = null;

  switch (ex.type) {
    case "IDEA": {
      const r = await db.idea.create({
        data: {
          title: String(p.title ?? ex.title),
          description: String(p.description ?? ""),
          impact: level(p.impact),
          effort: level(p.effort),
          urgency: level(p.urgency),
          category: p.category ? String(p.category) : null,
          sourceImportId: ex.importId,
        },
      });
      recordId = r.id;
      break;
    }
    case "TASK": {
      const r = await db.task.create({
        data: {
          title: String(p.title ?? ex.title),
          description: p.description ? String(p.description) : null,
          priority: level(p.priority),
        },
      });
      recordId = r.id;
      break;
    }
    case "MEMORY":
    case "STRATEGY": {
      const r = await db.knowledgeItem.create({
        data: {
          title: String(p.title ?? ex.title),
          body: String(p.body ?? ""),
          type: ex.type === "STRATEGY" ? "STRATEGY" : ktype(p.type),
          priority: prio(p.priority),
          sourceImportId: ex.importId,
        },
      });
      recordId = r.id;
      break;
    }
    case "CASE": {
      const r = await db.case.create({
        data: {
          title: String(p.title ?? ex.title),
          client: p.client ? String(p.client) : null,
          currentSituation: p.currentSituation ? String(p.currentSituation) : null,
          whatStoodOut: p.whatStoodOut ? String(p.whatStoodOut) : null,
          idea: p.idea ? String(p.idea) : null,
          solution: p.solution ? String(p.solution) : null,
          result: p.result ? String(p.result) : null,
        },
      });
      recordId = r.id;
      break;
    }
    case "SOCIAL": {
      const r = await db.socialContent.create({
        data: {
          type: stype(p.type),
          title: p.title ? String(p.title) : null,
          body: String(p.body ?? ""),
        },
      });
      recordId = r.id;
      break;
    }
  }

  await db.extraction.update({
    where: { id },
    data: { status: "ACCEPTED", createdRecordId: recordId },
  });
  await markApplied(ex.importId);
  revalidatePath(`/import/${ex.importId}`);
}

export async function rejectExtraction(id: string) {
  const ex = await db.extraction.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath(`/import/${ex.importId}`);
}

export async function acceptAllProposed(importId: string) {
  const proposed = await db.extraction.findMany({
    where: { importId, status: "PROPOSED" },
    select: { id: true },
  });
  for (const { id } of proposed) {
    await acceptExtraction(id);
  }
  revalidatePath(`/import/${importId}`);
}

export async function deleteImport(id: string) {
  await db.chatImport.delete({ where: { id } });
  revalidatePath("/import");
  redirect("/import");
}

async function markApplied(importId: string) {
  await db.chatImport.update({
    where: { id: importId },
    data: { status: "APPLIED" },
  });
}
