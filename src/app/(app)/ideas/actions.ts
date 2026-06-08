"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { scoreIdee } from "@/lib/ai/workflows";
import type { IdeaStatus, Level } from "@prisma/client";

export async function createIdea(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;

  await db.idea.create({
    data: {
      title,
      description,
      impact: (formData.get("impact") as Level) ?? "MIDDEL",
      effort: (formData.get("effort") as Level) ?? "MIDDEL",
      urgency: (formData.get("urgency") as Level) ?? "MIDDEL",
      category: String(formData.get("category") ?? "").trim() || null,
    },
  });
  revalidatePath("/ideas");
}

export async function setIdeaStatus(id: string, status: IdeaStatus) {
  await db.idea.update({ where: { id }, data: { status } });
  revalidatePath("/ideas");
}

export async function deleteIdea(id: string) {
  await db.idea.delete({ where: { id } });
  revalidatePath("/ideas");
}

// AI: scoor het idee en maak meteen voorgestelde taken aan.
export async function aiScoreIdea(id: string) {
  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return;

  const result = await scoreIdee({
    title: idea.title,
    description: idea.description,
  });

  await db.idea.update({
    where: { id },
    data: {
      impact: result.impact,
      effort: result.effort,
      urgency: result.urgency,
    },
  });

  if (result.suggestedTasks?.length) {
    await db.task.createMany({
      data: result.suggestedTasks.slice(0, 5).map((t) => ({
        title: t,
        ideaId: id,
      })),
    });
  }

  revalidatePath("/ideas");
  revalidatePath("/tasks");
}
