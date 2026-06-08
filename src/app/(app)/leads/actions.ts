"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/ai/provider";
import { buildSystemContext } from "@/lib/ai/context";
import { fetchSiteText } from "@/lib/web";
import type { LeadStatus } from "@prisma/client";

export async function createLead(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  if (!company) return;

  const lead = await db.lead.create({
    data: {
      company,
      website: String(formData.get("website") ?? "").trim() || null,
      contactPerson: String(formData.get("contactPerson") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      problemObserved: String(formData.get("problemObserved") ?? "").trim() || null,
      possibleSolution: String(formData.get("possibleSolution") ?? "").trim() || null,
      nextAction: String(formData.get("nextAction") ?? "").trim() || null,
      nextActionAt: String(formData.get("nextActionAt") ?? "").trim()
        ? new Date(String(formData.get("nextActionAt")))
        : null,
      source: String(formData.get("source") ?? "").trim() || null,
      score: Number(formData.get("score") ?? 50),
    },
  });

  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  await db.lead.update({
    where: { id },
    data: {
      company: String(formData.get("company") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim() || null,
      contactPerson: String(formData.get("contactPerson") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      problemObserved: String(formData.get("problemObserved") ?? "").trim() || null,
      possibleSolution: String(formData.get("possibleSolution") ?? "").trim() || null,
      nextAction: String(formData.get("nextAction") ?? "").trim() || null,
      nextActionAt: String(formData.get("nextActionAt") ?? "").trim()
        ? new Date(String(formData.get("nextActionAt")))
        : null,
      score: Number(formData.get("score") ?? 50),
      lastContactAt: new Date(),
    },
  });
  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function deleteLead(id: string) {
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
  redirect("/leads");
}

// AI: analyseer website en schrijf benaderings-concept (mail + LinkedIn)
export async function aiAnalyseLead(id: string) {
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return;

  const siteData = lead.website
    ? await fetchSiteText(lead.website)
    : { ok: false, text: "", title: undefined };

  const system = await buildSystemContext(
    `Je helpt Daan met het analyseren van potentiële klanten en het schrijven van persoonlijke outreach.
De aanpak is altijd: kom binnen met inzicht (huidige situatie + gemiste kans), nooit met een verkooppraatje.
Schrijf alsof Daan het zelf schrijft: nuchter, direct, founder-led. Geen emoji's, geen em-dashes.`
  );

  const siteContext = siteData.ok
    ? `Website-inhoud (${lead.website}):\n${siteData.text}`
    : `Website: ${lead.website ?? "onbekend"} (kon niet worden opgehaald)`;

  const prompt = `Analyseer dit bedrijf en schrijf een benaderings-concept voor Daan.

Bedrijf: ${lead.company}
Contact: ${lead.contactPerson ?? "onbekend"}
${siteContext}
Probleem dat Daan ziet: ${lead.problemObserved ?? "nog niet ingevuld"}
Mogelijke oplossing: ${lead.possibleSolution ?? "nog niet ingevuld"}

Geef je antwoord als JSON met exact deze structuur:
{
  "analysis": {
    "currentSituation": "wat doet dit bedrijf, hoe ziet hun digitale situatie eruit",
    "missedOpportunity": "wat missen ze concreet, welke kans laten ze liggen",
    "fitScore": 0-100,
    "fitReason": "waarom past WebsUp wel of niet"
  },
  "outreach": {
    "emailSubject": "een persoonlijke, nieuwsgierig makende onderwerpregel",
    "emailBody": "de mail, max 120 woorden, opener gebaseerd op een concreet detail van hun site",
    "linkedinMessage": "een LinkedIn DM, max 60 woorden, persoonlijk en direct"
  }
}`;

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    model: "smart",
    json: true,
  });

  const result = JSON.parse(raw);

  await db.lead.update({
    where: { id },
    data: {
      websiteAnalysis: result.analysis ?? null,
      outreach: result.outreach ?? null,
      score: result.analysis?.fitScore ?? lead.score,
    },
  });

  revalidatePath(`/leads/${id}`);
}
