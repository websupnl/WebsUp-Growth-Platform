import { getProvider } from "./provider";
import { buildSystemContext } from "./context";

// Gerichte AI-acties. Geen los chatvenster, maar getypeerde workflows.
// In Fase 1 is dit scoreIdee. Fase 2+ voegt analyseChat, auditWebsite etc. toe.

export type IdeaScore = {
  impact: "LAAG" | "MIDDEL" | "HOOG";
  effort: "LAAG" | "MIDDEL" | "HOOG";
  urgency: "LAAG" | "MIDDEL" | "HOOG";
  reasoning: string;
  suggestedTasks: string[];
};

export async function scoreIdee(input: {
  title: string;
  description: string;
}): Promise<IdeaScore> {
  const system = await buildSystemContext(
    "Beoordeel het onderstaande idee voor WebsUp op impact, moeite en urgentie. Denk vanuit 'Road to 10 clients in 2 maanden'."
  );

  const prompt = `Idee: ${input.title}
Omschrijving: ${input.description}

Geef je antwoord als JSON met exact deze velden:
{
  "impact": "LAAG|MIDDEL|HOOG",
  "effort": "LAAG|MIDDEL|HOOG",
  "urgency": "LAAG|MIDDEL|HOOG",
  "reasoning": "korte nuchtere onderbouwing in 1-2 zinnen",
  "suggestedTasks": ["concrete taak 1", "concrete taak 2"]
}`;

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    model: "fast",
    json: true,
  });

  return JSON.parse(raw) as IdeaScore;
}
