import { getProvider } from "./provider";
import { buildSystemContext } from "./context";
import { fetchSiteText } from "@/lib/web";

export type AuditResult = {
  summary: string;
  score: number; // 0-100, hoe goed de site er nu voor staat
  improvements: {
    category: string;
    title: string;
    problem: string;
    suggestion: string;
    impact: "LAAG" | "MIDDEL" | "HOOG";
  }[];
  quickWins: string[];
  websupFit: string; // hoe WebsUp hier concreet kan helpen
};

export async function auditWebsite(url: string): Promise<AuditResult> {
  const site = await fetchSiteText(url);

  const system = await buildSystemContext(
    `Je analyseert websites voor WebsUp en stelt een persoonlijk verbeterplan op.
Wees concreet en eerlijk. Schrijf alsof Daan het zelf opschrijft: nuchter, direct, geen consultancytaal.
Focus op wat de eigenaar het meest helpt, niet op technische perfectie.
Categorieën: Conversie, SEO, Design, Snelheid, Mobiel, CTA, Content, Vertrouwen.`
  );

  const siteContext = site.ok
    ? `Paginatitel: ${site.title ?? "onbekend"}\n\nInhoud:\n${site.text}`
    : `De website kon niet worden opgehaald. Analyseer op basis van de URL: ${url}`;

  const prompt = `Maak een persoonlijk verbeterplan voor: ${url}

${siteContext}

Geef je antwoord als JSON met exact deze structuur:
{
  "summary": "2-3 zinnen over de algemene indruk en grootste kans",
  "score": 0-100,
  "improvements": [
    {
      "category": "Conversie|SEO|Design|Snelheid|Mobiel|CTA|Content|Vertrouwen",
      "title": "Korte naam van het verbeterpunt",
      "problem": "Wat er nu misgaat of ontbreekt",
      "suggestion": "Concrete aanbeveling, wat je precies zou veranderen",
      "impact": "LAAG|MIDDEL|HOOG"
    }
  ],
  "quickWins": ["actie die morgen te doen is", "nog een quick win"],
  "websupFit": "Hoe WebsUp dit bedrijf concreet verder kan helpen, 2-3 zinnen"
}

Geef 4-7 verbeterpunten. Sorteer op impact (hoog eerst).`;

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    model: "smart",
    json: true,
  });

  return JSON.parse(raw) as AuditResult;
}
