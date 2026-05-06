# neo-geo

MVP serverless API-only para monitorizar visibilidad de marca en respuestas de LLMs. Producto interno de FoodBox con base SaaS multi-tenant.

## Stack

- Next.js 15 App Router con TypeScript strict.
- Supabase Auth/Postgres/RLS con Supabase JS v2.
- shadcn/ui, Tailwind CSS v4, Radix y next-themes.
- Biome para lint/format.
- Vitest para tests unitarios mínimos.

## Convenciones

- UI en español.
- Server Components por defecto.
- Mutaciones con Server Actions; `route.ts` solo para webhooks o integraciones externas.
- Importaciones absolutas con `@/`.
- Sin `any` salvo justificación explícita.

## Changelog

- 06/05/2026: PR 1 iniciado con setup base Next.js, shadcn, Biome, Supabase helpers y migración inicial.
