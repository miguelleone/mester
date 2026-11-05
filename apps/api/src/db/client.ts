import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const url = process.env.DATABASE_URL ?? 'postgres://mester:mester@localhost:5432/mester'

export const sql = postgres(url)
export const db = drizzle(sql, { schema })
