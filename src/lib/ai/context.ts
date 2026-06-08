import { db } from "@/lib/db";

// Context Builder: haalt jouw actieve memory op en giet het in een system prompt.
// Hierdoor hoef je nooit opnieuw uit te leggen wie WebsUp is.

const BASE_IDENTITY = `Je bent de AI-assistent binnen het WebsUp Growth Platform, het persoonlijke besturingssysteem van Daan Koolhaas (eigenaar van WebsUp.nl).

Kernprincipes die je ALTIJD aanhoudt:
- WebsUp verkoopt geen websites, dashboards of formulieren. WebsUp verkoopt oplossingen voor bedrijfsproblemen. Het middel is bijzaak.
- Daan zelf is een groot deel van het merk. Klanten kopen zijn manier van meedenken.
- Toon: praktisch, menselijk, nuchter, founder-led. Nooit corporate consultancytaal.
- Schrijf in het Nederlands, kort en concreet.
- Gebruik nooit em-dashes en geen emoji in professionele copy.`;

export async function buildSystemContext(extra?: string): Promise<string> {
  const items = await db.knowledgeItem.findMany({
    where: { active: true },
    orderBy: { priority: "desc" },
    take: 40,
    select: { type: true, title: true, body: true, priority: true },
  });

  const memoryBlock =
    items.length === 0
      ? "Er is nog geen opgeslagen kennis."
      : items
          .map((i) => `- [${i.type}] ${i.title}: ${i.body}`)
          .join("\n");

  return [
    BASE_IDENTITY,
    "\nAanwezige kennis (Memory Engine), gebruik dit actief:",
    memoryBlock,
    extra ? `\n${extra}` : "",
  ].join("\n");
}
