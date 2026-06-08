"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auditWebsite } from "@/lib/ai/audit";
import type { AuditStatus } from "@prisma/client";

export async function runAudit(id: string) {
  const audit = await db.websiteAudit.findUnique({ where: { id } });
  if (!audit) return;

  const result = await auditWebsite(audit.url);

  await db.websiteAudit.update({
    where: { id },
    data: {
      analysis: result,
      status: "GEANALYSEERD",
    },
  });

  // Maak automatisch een opvolgingstaak aan
  await db.task.create({
    data: {
      title: `Verbeterplan versturen naar ${audit.requesterEmail ?? audit.url}`,
      description: `Audit voor ${audit.url}. Score: ${result.score}/100.`,
      priority: "HOOG",
    },
  });

  revalidatePath(`/audits/${id}`);
  revalidatePath("/audits");
}

export async function setAuditStatus(id: string, status: AuditStatus) {
  await db.websiteAudit.update({ where: { id }, data: { status } });
  revalidatePath(`/audits/${id}`);
  revalidatePath("/audits");
}

export async function linkLeadToAudit(auditId: string, formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  if (!company) return;

  const audit = await db.websiteAudit.findUnique({ where: { id: auditId } });
  if (!audit) return;

  const lead = await db.lead.create({
    data: {
      company,
      website: audit.url,
      email: audit.requesterEmail ?? null,
      contactPerson: audit.requesterName ?? null,
      source: "Verbeterplan aanvraag",
      status: "GEKWALIFICEERD",
    },
  });

  await db.websiteAudit.update({
    where: { id: auditId },
    data: { leadId: lead.id },
  });

  revalidatePath(`/audits/${auditId}`);
}
