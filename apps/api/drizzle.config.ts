import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit roda a partir de apps/api; o .env fica na raiz do repo
const rootEnv = resolve(process.cwd(), '../../.env')
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv)

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://mester:mester@localhost:5432/mester' },
  extensionsFilters: ['postgis'],
})
