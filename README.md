# Mester

Plataforma de adoção e cuidado de espaços urbanos, começando por Recife (Lei 18.280/2016).
Moradores reportam espaços degradados, adotantes financiam a revitalização e prestadores locais executam, com registro de antes e depois.

O nome vem dos *mesteres*, as corporações medievais de artesãos.

## Stack

- **web**: React + TypeScript (Vite), Tailwind e Leaflet
- **api**: Fastify + TypeScript, Zod e Drizzle ORM
- **banco**: PostgreSQL + PostGIS (Docker)

## Rodando localmente

Requisitos: Node 22 e Docker.

```bash
cp .env.example .env
npm install
npm run db:up                 # sobe o PostGIS
npm run db:migrate -w api     # cria as tabelas
npm run db:seed -w api        # espaços de exemplo em Recife
npm run dev:api               # http://localhost:3333
npm run dev:web               # http://localhost:5173
```

## Estrutura

```
apps/
  api/   API Fastify (src/routes, src/db/schema.ts, drizzle/ com migrações)
  web/   Front React (o Vite repassa /api para a API)
```

## Endpoints

- `GET /health`
- `GET /spaces?lat=&lng=&radiusKm=`: lista espaços, com filtro opcional por raio (PostGIS `ST_DWithin`)
