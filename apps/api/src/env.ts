import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Carrega o .env da raiz do repositório, de onde quer que o processo seja iniciado.
// Variáveis já definidas no ambiente têm precedência sobre o arquivo.
const rootEnv = fileURLToPath(new URL('../../../.env', import.meta.url))
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv)

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://mester:mester@localhost:5432/mester',
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET ?? '',
}

if (!env.jwtSecret) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET não definido')
  env.jwtSecret = 'dev-secret-nao-use-em-producao'
}
