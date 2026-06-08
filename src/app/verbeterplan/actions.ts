"use server";

import { db } from "@/lib/db";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function submitVerbeterplan(
  formData: FormData
): Promise<SubmitResult> {
  const url = String(formData.get("url") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!url || !email) {
    return { ok: false, error: "Vul je website-URL en e-mailadres in." };
  }

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  const audit = await db.websiteAudit.create({
    data: {
      url: normalized,
      requesterName: name || null,
      requesterEmail: email,
      status: "AANGEVRAAGD",
    },
  });

  return { ok: true, id: audit.id };
}
