# WebsUp Growth Platform

Het persoonlijke besturingssysteem van WebsUp. Eén bron van waarheid: PostgreSQL. Het filesystem is ondersteunend (ruwe chatdumps, screenshots, exports, backups).

Doel: Road to 10 clients in 2 maanden.

## Stack

Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind · shadcn-stijl UI · OpenAI (achter een provider-adapter) · Docker · Coolify.

## Architectuurregel

Alle gestructureerde kennis leeft in PostgreSQL. AI schrijft nooit direct naar de waarheid: het maakt voorstellen (`extractions`) die jij goedkeurt. Pas daarna worden het echte records.

## Modules

| Status | Module | Route |
|---|---|---|
| Klaar | Dashboard | `/` |
| Klaar | Memory Engine | `/memory` |
| Klaar | Ideeën Inbox | `/ideas` |
| Klaar | Taken | `/tasks` |
| Volgt (Fase 2) | Chat Import | `/import` |
| Volgt (Fase 3) | Lead CRM | `/leads` |
| Volgt (Fase 4) | Website Verbeterplan | `/audits` |
| Volgt (Fase 5) | Case Builder | `/cases` |
| Volgt (Fase 5) | Social Content Engine | `/content` |

## Lokaal draaien

1. `npm install`
2. Kopieer `.env.example` naar `.env` en vul in (`APP_PASSWORD`, `AUTH_SECRET`, `OPENAI_API_KEY`).
3. Start Postgres: `docker compose up -d db` (of gebruik je eigen database in `DATABASE_URL`).
4. `npm run db:push` om het schema te zetten.
5. `npm run db:seed` voor het hoofd-doel en de kern-memory.
6. `npm run dev` en ga naar http://localhost:3000

## Deployen op Coolify

- Push naar GitHub.
- Maak in Coolify een nieuwe resource op basis van deze repo (de `Dockerfile` wordt gebruikt).
- Koppel een PostgreSQL-database en zet de env-variabelen (zie `.env.example`).
- Na de eerste deploy: draai eenmalig `npx prisma db push` en `npm run db:seed` in de container.

## Roadmap

- Fase 0: scaffold, database, Docker, auth, designsysteem. **Klaar.**
- Fase 1: Memory + Ideeën + Taken + dashboard. **Klaar.**
- Fase 2: Chat Import met goedkeuringspijplijn.
- Fase 3: Lead CRM met AI-benadering.
- Fase 4: Website Verbeterplan (leadmagneet).
- Fase 5: Case Builder + Social Content Engine.
- Fase 6: dashboardpolish + automatische leadfinder.
