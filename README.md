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
npm run db:seed -w api        # espaços de exemplo em Recife + admin de dev
npm run dev:api               # http://localhost:3333
npm run dev:web               # http://localhost:5173
```

Todo o projeto lê o `.env` da raiz (API, migrações, seed, Vite e Docker Compose); não precisa copiá-lo para `apps/api`.
Se a porta 5432 já estiver em uso, mude `DB_PORT` (ex.: `5433`) e a porta em `DATABASE_URL` no `.env`.

O seed cria o admin `admin@mester.local` / `admin12345` (troque com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`).

## Estrutura

```
apps/
  api/   API Fastify (src/routes, src/db/schema.ts, drizzle/ com migrações)
  web/   Front React (o Vite repassa /api para a API)
```

## Endpoints

- `GET /health`
- `POST /auth/register`: `{ name, email, password, role?, provider? }`. Papéis no cadastro: `morador` (padrão), `adotante`, `prestador` (cria perfil de prestador `pendente`). `gestor` e `admin` não são escolhidos no cadastro.
- `POST /auth/login`: `{ email, password }` → `{ token, user }`
- `GET /auth/me`: usuário do token (`Authorization: Bearer <token>`)

Para proteger uma rota: `preHandler: authenticate` (qualquer usuário logado) ou `preHandler: requireRole('gestor')` (admin sempre passa), de `src/auth/guards.ts`.
- `GET /spaces?lat=&lng=&radiusKm=`: lista espaços, com filtro opcional por raio (PostGIS `ST_DWithin`)
- `GET /spaces/:id`: detalhe do espaço com o histórico de reportes (autor e data)
- `POST /spaces` (logado): reporta um espaço novo `{ name, type, lat, lng, description, isPublic?, photos? }`; cria o espaço com status `reportado` e o primeiro reporte
- `POST /spaces/:id/reports` (logado): reforça o reporte de um espaço existente `{ description, photos? }`
- `PATCH /spaces/:id/status` (gestor ou admin): `{ status }` (`reportado`, `com_proposta`, `em_obra`, `adotado`)
- `POST /uploads` (logado, multipart, campo `file`): envia uma foto (JPG, PNG ou WebP, até 5 MB) e devolve `{ url }` para usar em `photos` (até 5 por reporte). As fotos ficam em `apps/api/uploads` (mude com `UPLOADS_DIR`) e são servidas em `GET /uploads/<arquivo>`

No front, o detalhe de um espaço tem link próprio: `/#/espacos/<id>`.
