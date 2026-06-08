import { getProvider } from "./provider";
import { buildSystemContext } from "./context";
import type { SocialType } from "@prisma/client";

export type CaseSuggestion = {
  currentSituation: string;
  whatStoodOut: string;
  idea: string;
  solution: string;
  result: string;
  futureVision: string;
};

export async function suggestCaseStructure(input: {
  client: string;
  rawNotes: string;
}): Promise<CaseSuggestion> {
  const system = await buildSystemContext(
    `Je helpt Daan een case uit te werken volgens de WebsUp-structuur.
Cases zijn transformatiegericht, niet projectgericht.
De lezer moet voelen: dit bedrijf is veranderd dankzij WebsUp.
Schrijf concreet, nuchter en founder-led. Geen em-dashes, geen emoji.`
  );

  const prompt = `Werk deze case uit voor ${input.client}.

Ruwe notities van Daan:
"""
${input.rawNotes}
"""

Geef je antwoord als JSON:
{
  "currentSituation": "hoe het bedrijf eruitzag voor WebsUp. Concreet, herkenbaar voor de eigenaar.",
  "whatStoodOut": "wat Daan opviel toen hij er voor het eerst naar keek. 1-2 zinnen.",
  "idea": "het initiële idee dat Daan had om dit op te lossen.",
  "solution": "wat er daadwerkelijk gebouwd of veranderd is.",
  "result": "het concrete resultaat. Gebruik cijfers als die in de notities staan.",
  "futureVision": "wat er nu mogelijk is wat daarvoor niet mogelijk was."
}`;

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    model: "smart",
    json: true,
  });

  return JSON.parse(raw) as CaseSuggestion;
}

export type SocialPiece = {
  type: SocialType;
  title: string;
  body: string;
};

const socialInstructions: Record<SocialType, string> = {
  LINKEDIN_CASE: `Schrijf een LinkedIn case study post (400-600 woorden).
Structuur: hook (eerste zin = de transformatie), situatie, inzicht, aanpak, resultaat, toekomstbeeld, CTA.
Geen bullet walls. Afwisselend korte en langere alinea's.`,

  LINKEDIN_SHORT: `Schrijf een korte LinkedIn post (100-150 woorden).
Begin met een sterke één-zins hook. Vertel één inzicht uit de case. Sluit af met een vraag of CTA.`,

  INSTAGRAM_CAROUSEL: `Schrijf een Instagram carousel (7-10 slides).
Slide 1: pakkende titel die mensen laat swipeN.
Slides 2-9: elk één punt, kort en visueel denkend (schrijf de tekst per slide, begin elke slide met "Slide X:").
Slide 10: CTA.`,

  REEL_SCRIPT: `Schrijf een Reels/TikTok video-script (45-60 seconden spreektijd).
Formaat: Hook (5 sec) | Probleem (10 sec) | Oplossing (20 sec) | Resultaat (10 sec) | CTA (5 sec).
Schrijf het als een script met [aanwijzingen] voor beeld.`,

  TIKTOK_HOOK: `Schrijf 5 verschillende TikTok hooks voor deze case.
Een hook is de openingszin die iemand laat stoppen met scrollen (max 10 woorden elk).
Geef ze genummerd terug.`,

  STORY: `Schrijf een reeks van 5 Instagram Stories voor deze case.
Elke story is één scherm tekst + een suggestie voor het beeld (schrijf als: [Beeld: ...] Tekst: ...).
Story 5 heeft een poll of vraag als interactie.`,
};

export async function generateSocialContent(
  caseData: {
    title: string;
    client?: string | null;
    currentSituation?: string | null;
    whatStoodOut?: string | null;
    idea?: string | null;
    solution?: string | null;
    result?: string | null;
    futureVision?: string | null;
    socialProof?: string | null;
  },
  type: SocialType
): Promise<SocialPiece> {
  const system = await buildSystemContext(
    `Je schrijft social content voor WebsUp op basis van cases.
Schrijf altijd in de stem van Daan: direct, nuchter, founder-led. Geen corporate taal, geen em-dashes.
De case bewijst dat WebsUp oplossingen verkoopt, niet websites.`
  );

  const caseContext = `
Case: ${caseData.title}
Klant: ${caseData.client ?? "anoniem"}
Huidige situatie: ${caseData.currentSituation ?? ""}
Wat viel op: ${caseData.whatStoodOut ?? ""}
Idee: ${caseData.idea ?? ""}
Oplossing: ${caseData.solution ?? ""}
Resultaat: ${caseData.result ?? ""}
Toekomstbeeld: ${caseData.futureVision ?? ""}
Social proof: ${caseData.socialProof ?? ""}`.trim();

  const instruction = socialInstructions[type];

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `${instruction}\n\nCase-informatie:\n${caseContext}`,
      },
    ],
    model: "smart",
    temperature: 0.6,
  });

  return { type, title: `${type} - ${caseData.title}`, body: raw };
}
