import { db, sql } from './client.js'
import { spaces, users } from './schema.js'
import { hashPassword } from '../auth/password.js'

await db.insert(spaces).values([
  { name: 'Praça do Arsenal', type: 'praca', location: { x: -34.8711, y: -8.0631 } },
  { name: 'Muro da Rua da Aurora', type: 'muro', location: { x: -34.8790, y: -8.0590 } },
  { name: 'Canteiro da Av. Boa Viagem', type: 'canteiro', location: { x: -34.8945, y: -8.1180 }, status: 'com_proposta' },
])

// Admin de desenvolvimento (gestor e admin não podem ser escolhidos no cadastro público)
const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@mester.local'
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345'
await db.insert(users)
  .values({ name: 'Admin', email: adminEmail, passwordHash: await hashPassword(adminPassword), role: 'admin' })
  .onConflictDoNothing({ target: users.email })

console.log(`Seed concluído (admin: ${adminEmail})`)
await sql.end()
