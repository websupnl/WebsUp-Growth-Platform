import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Hoofd-doel: Road to 10 clients in 2 maanden
  const existing = await db.goal.findFirst({ where: { isPrimary: true } });
  if (!existing) {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 2);
    await db.goal.create({
      data: {
        title: "Road to 10 clients",
        target: 10,
        current: 0,
        isPrimary: true,
        deadline,
      },
    });
  }

  // Kernprincipes als startkennis voor de Memory Engine
  const seedMemory = [
    {
      type: "STRATEGY" as const,
      title: "WebsUp verkoopt oplossingen, geen websites",
      body: "Een website, dashboard, formulier of AI-agent is slechts het middel. We verkopen oplossingen voor bedrijfsproblemen. Dit principe stuurt elke case, pitch en stuk content.",
      priority: 10,
    },
    {
      type: "STRATEGY" as const,
      title: "Daan is een groot deel van het merk",
      body: "Klanten kopen niet alleen software, maar Daans manier van meedenken. Toon is praktisch, menselijk, nuchter en founder-led. Nooit corporate consultancytaal.",
      priority: 9,
    },
    {
      type: "PROCESS" as const,
      title: "Cases zijn transformatiegericht",
      body: "Een case toont: huidige situatie, wat viel op, idee, oplossing, demo, dashboard, workflow, resultaat, toekomstbeeld en social proof. Niet projectgericht maar transformatiegericht.",
      priority: 8,
    },
    {
      type: "LESSON" as const,
      title: "Bouma-case: binnenkomen met inzicht, niet met techniek",
      body: "Bij Bouma kwam Daan binnen met de huidige situatie, een gemiste kans, een visueel voorbeeld en een praktische oplossing. Niet met techniek. Dit is het leidende verkoopprincipe.",
      priority: 8,
    },
    {
      type: "STRATEGY" as const,
      title: "Verbeterplan is de hoofd-CTA",
      body: "Upload je website en ontvang binnen 48 uur een persoonlijk verbeterplan. Lagere drempel dan direct een website kopen. Belangrijkste leadmagneet.",
      priority: 7,
    },
  ];

  for (const m of seedMemory) {
    const found = await db.knowledgeItem.findFirst({ where: { title: m.title } });
    if (!found) await db.knowledgeItem.create({ data: m });
  }

  console.log("Seed klaar.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
