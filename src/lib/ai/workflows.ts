import { getProvider } from "./provider";
import { buildSystemContext } from "./context";

// Gerichte AI-acties. Geen los chatvenster, maar getypeerde workflows.
// In Fase 1 is dit scoreIdee. Fase 2+ voegt analyseChat, auditWebsite etc. toe.

// ─── Chat Import analyse ────────────────────────────────────────────────
export type ChatAnalysis = {
  ideas: {
    title: string;
    description: string;
    impact: "LAAG" | "MIDDEL" | "HOOG";
    effort: "LAAG" | "MIDDEL" | "HOOG";
    urgency: "LAAG" | "MIDDEL" | "HOOG";
    category?: string;
  }[];
  tasks: {
    title: string;
    description?: string;
    priority: "LAAG" | "MIDDEL" | "HOOG";
  }[];
  memory: {
    title: string;
    body: string;
    type: "MEMORY" | "INSIGHT" | "STRATEGY" | "PROCESS" | "LESSON" | "DECISION";
    priority: number;
  }[];
  cases: {
    title: string;
    client?: string;
    currentSituation?: string;
    whatStoodOut?: string;
    idea?: string;
    solution?: string;
    result?: string;
  }[];
  social: {
    type:
      | "LINKEDIN_CASE"
      | "LINKEDIN_SHORT"
      | "INSTAGRAM_CAROUSEL"
      | "REEL_SCRIPT"
      | "TIKTOK_HOOK"
      | "STORY";
    title?: string;
    body: string;
  }[];
};

export async function analyseChat(rawContent: string): Promise<ChatAnalysis> {
  const system = await buildSystemContext(
    `Je analyseert een geplakt gesprek (ChatGPT, Claude, Codex of losse notities) van Daan.
Haal eruit wat waardevol is om vast te leggen in zijn besturingssysteem. Verzin niets bij: alleen wat echt in de tekst staat of er logisch uit volgt.
Wees selectief en concreet. Liever vijf scherpe items dan twintig vage. Schrijf alles in het Nederlands, nuchter en founder-led.`
  );

  const prompt = `Analyseer dit gesprek en geef het resultaat als JSON met exact deze structuur (laat arrays leeg als er niets relevants is):
{
  "ideas":  [{ "title": "", "description": "", "impact": "LAAG|MIDDEL|HOOG", "effort": "LAAG|MIDDEL|HOOG", "urgency": "LAAG|MIDDEL|HOOG", "category": "" }],
  "tasks":  [{ "title": "", "description": "", "priority": "LAAG|MIDDEL|HOOG" }],
  "memory": [{ "title": "", "body": "", "type": "MEMORY|INSIGHT|STRATEGY|PROCESS|LESSON|DECISION", "priority": 1-10 }],
  "cases":  [{ "title": "", "client": "", "currentSituation": "", "whatStoodOut": "", "idea": "", "solution": "", "result": "" }],
  "social": [{ "type": "LINKEDIN_CASE|LINKEDIN_SHORT|INSTAGRAM_CAROUSEL|REEL_SCRIPT|TIKTOK_HOOK|STORY", "title": "", "body": "" }]
}

Gesprek:
"""
${rawContent.slice(0, 24000)}
"""`;

  const raw = await getProvider().complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    model: "smart",
    json: true,
  });

  const parsed = JSON.parse(raw) as Partial<ChatAnalysis>;
  return {
    ideas: parsed.ideas ?? [],
    tasks: parsed.tasks ?? [],
    memory: parsed.memory ?? [],
    cases: parsed.cases ?? [],
    social: parsed.social ?? [],
  };
}

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
