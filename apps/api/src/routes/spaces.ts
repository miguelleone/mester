import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { sql as dsql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { spaces, spaceType, spaceStatus } from '../db/schema.js'

const spaceOut = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(spaceType.enumValues),
  status: z.enum(spaceStatus.enumValues),
  lat: z.number(),
  lng: z.number(),
})

export const spacesRoutes: FastifyPluginAsyncZod = async (app) => {
  // Lista espaços, opcionalmente filtrando por raio (km) a partir de um ponto
  app.get('/spaces', {
    schema: {
      querystring: z.object({
        lat: z.coerce.number().optional(),
        lng: z.coerce.number().optional(),
        radiusKm: z.coerce.number().positive().max(50).default(5),
      }),
      response: { 200: z.array(spaceOut) },
    },
  }, async (req) => {
    const { lat, lng, radiusKm } = req.query
    const near = lat !== undefined && lng !== undefined
      ? dsql`ST_DWithin(${spaces.location}::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})`
      : undefined

    const rows = await db.select().from(spaces).where(near)
    return rows.map((s) => ({
      id: s.id, name: s.name, type: s.type, status: s.status,
      lng: s.location.x, lat: s.location.y,
    }))
  })
}
