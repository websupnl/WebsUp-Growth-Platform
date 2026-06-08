"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { KnowledgeType } from "@prisma/client";

export async function createMemory(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  await db.knowledgeItem.create({
    data: {
      title,
      body,
      type: (formData.get("type") as KnowledgeType) ?? "MEMORY",
      priority: Number(formData.get("priority") ?? 5),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    },
  });
  revalidatePath("/memory");
}

export async function toggleActive(id: string, active: boolean) {
  await db.knowledgeItem.update({ where: { id }, data: { active } });
  revalidatePath("/memory");
}

export async function deleteMemory(id: string) {
  await db.knowledgeItem.delete({ where: { id } });
  revalidatePath("/memory");
}
