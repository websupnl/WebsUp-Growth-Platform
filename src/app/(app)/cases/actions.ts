"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { suggestCaseStructure, generateSocialContent } from "@/lib/ai/cases";
import type { CaseStatus, SocialType } from "@prisma/client";

export async function createCase(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const c = await db.case.create({
    data: {
      title,
      client: String(formData.get("client") ?? "").trim() || null,
    },
  });

  redirect(`/cases/${c.id}`);
}

export async function updateCase(id: string, formData: FormData) {
  await db.case.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      client: String(formData.get("client") ?? "").trim() || null,
      currentSituation: String(formData.get("currentSituation") ?? "").trim() || null,
      whatStoodOut: String(formData.get("whatStoodOut") ?? "").trim() || null,
      idea: String(formData.get("idea") ?? "").trim() || null,
      solution: String(formData.get("solution") ?? "").trim() || null,
      demo: String(formData.get("demo") ?? "").trim() || null,
      dashboard: String(formData.get("dashboard") ?? "").trim() || null,
      workflow: String(formData.get("workflow") ?? "").trim() || null,
      result: String(formData.get("result") ?? "").trim() || null,
      futureVision: String(formData.get("futureVision") ?? "").trim() || null,
      socialProof: String(formData.get("socialProof") ?? "").trim() || null,
    },
  });
  revalidatePath(`/cases/${id}`);
  revalidatePath("/cases");
}

export async function setCaseStatus(id: string, status: CaseStatus) {
  await db.case.update({ where: { id }, data: { status } });
  revalidatePath(`/cases/${id}`);
  revalidatePath("/cases");
}

export async function deleteCase(id: string) {
  await db.case.delete({ where: { id } });
  revalidatePath("/cases");
  redirect("/cases");
}

// AI: stel de structuur voor op basis van ruwe notities
export async function aiSuggestCase(id: string, formData: FormData) {
  const rawNotes = String(formData.get("rawNotes") ?? "").trim();
  if (!rawNotes) return;

  const c = await db.case.findUnique({ where: { id } });
  if (!c) return;

  const suggestion = await suggestCaseStructure({
    client: c.client ?? c.title,
    rawNotes,
  });

  await db.case.update({
    where: { id },
    data: {
      currentSituation: suggestion.currentSituation,
      whatStoodOut: suggestion.whatStoodOut,
      idea: suggestion.idea,
      solution: suggestion.solution,
      result: suggestion.result,
      futureVision: suggestion.futureVision,
    },
  });

  revalidatePath(`/cases/${id}`);
}

// Social Content: genereer één type content voor een case
export async function generateContent(id: string, formData: FormData) {
  const type = String(formData.get("type") ?? "") as SocialType;
  const validTypes: SocialType[] = [
    "LINKEDIN_CASE",
    "LINKEDIN_SHORT",
    "INSTAGRAM_CAROUSEL",
    "REEL_SCRIPT",
    "TIKTOK_HOOK",
    "STORY",
  ];
  if (!validTypes.includes(type)) return;

  const c = await db.case.findUnique({ where: { id } });
  if (!c) return;

  const piece = await generateSocialContent(c, type);

  await db.socialContent.create({
    data: {
      caseId: id,
      type: piece.type,
      title: piece.title,
      body: piece.body,
    },
  });

  revalidatePath(`/cases/${id}`);
  revalidatePath("/content");
}
