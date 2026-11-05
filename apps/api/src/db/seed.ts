import { db, sql } from './client.js'
import { spaces } from './schema.js'

await db.insert(spaces).values([
  { name: 'Praça do Arsenal', type: 'praca', location: { x: -34.8711, y: -8.0631 } },
  { name: 'Muro da Rua da Aurora', type: 'muro', location: { x: -34.8790, y: -8.0590 } },
  { name: 'Canteiro da Av. Boa Viagem', type: 'canteiro', location: { x: -34.8945, y: -8.1180 }, status: 'com_proposta' },
])

console.log('Seed concluído')
await sql.end()
