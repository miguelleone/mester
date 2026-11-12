import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { asc, eq, sql as dsql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { spaces, reports, users, spaceType, spaceStatus } from '../db/schema.js'
import { authenticate, requireRole } from '../auth/guards.js'
import { photoPath } from './uploads.js'

const spaceOut = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(spaceType.enumValues),
  status: z.enum(spaceStatus.enumValues),
  lat: z.number(),
  lng: z.number(),
})

const reportOut = z.object({
  id: z.string(),
  description: z.string(),
  photos: z.array(z.string()),
  author: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(),
})

const spaceDetailOut = spaceOut.extend({
  isPublic: z.boolean(),
  createdAt: z.string(),
  reports: z.array(reportOut),
})

const errorOut = z.object({ message: z.string() })
const reportBody = z.object({
  description: z.string().trim().min(10).max(2000),
  photos: z.array(photoPath).max(5).default([]),
})

type SpaceRow = typeof spaces.$inferSelect
const toSpaceOut = (s: SpaceRow) => ({
  id: s.id, name: s.name, type: s.type, status: s.status,
  lng: s.location.x, lat: s.location.y,
})

async function loadDetail(id: string) {
  const [s] = await db.select().from(spaces).where(eq(spaces.id, id))
  if (!s) return null
  const rows = await db
    .select({ report: reports, author: { id: users.id, name: users.name } })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.authorId))
    .where(eq(reports.spaceId, id))
    .orderBy(asc(reports.createdAt))
  return {
    ...toSpaceOut(s),
    isPublic: s.isPublic,
    createdAt: s.createdAt.toISOString(),
    reports: rows.map(({ report: r, author }) => ({
      id: r.id, description: r.description, photos: r.photos, author,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}

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

    const rows = await db.select().from(spaces).where(near).orderBy(asc(spaces.createdAt))
    return rows.map(toSpaceOut)
  })

  // Detalhe do espaço com o histórico de reportes
  app.get('/spaces/:id', {
    schema: {
      params: z.object({ id: z.uuid() }),
      response: { 200: spaceDetailOut, 404: errorOut },
    },
  }, async (req, reply) => {
    const detail = await loadDetail(req.params.id)
    if (!detail) return reply.code(404).send({ message: 'Espaço não encontrado' })
    return detail
  })

  // Morador (ou qualquer usuário logado) reporta um espaço novo: cria o espaço e o primeiro reporte
  app.post('/spaces', {
    onRequest: authenticate,
    schema: {
      body: reportBody.extend({
        name: z.string().trim().min(3).max(120),
        type: z.enum(spaceType.enumValues),
        isPublic: z.boolean().default(true),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
      response: { 201: spaceDetailOut },
    },
  }, async (req, reply) => {
    const { name, type, isPublic, lat, lng, description, photos } = req.body
    const id = await db.transaction(async (tx) => {
      const [s] = await tx.insert(spaces)
        .values({ name, type, isPublic, location: { x: lng, y: lat } })
        .returning({ id: spaces.id })
      await tx.insert(reports).values({ spaceId: s!.id, authorId: req.user.sub, description, photos })
      return s!.id
    })
    return reply.code(201).send((await loadDetail(id))!)
  })

  // Outro morador reforça o reporte de um espaço já existente
  app.post('/spaces/:id/reports', {
    onRequest: authenticate,
    schema: {
      params: z.object({ id: z.uuid() }),
      body: reportBody,
      response: { 201: spaceDetailOut, 404: errorOut },
    },
  }, async (req, reply) => {
    const [s] = await db.select({ id: spaces.id }).from(spaces).where(eq(spaces.id, req.params.id))
    if (!s) return reply.code(404).send({ message: 'Espaço não encontrado' })
    await db.insert(reports).values({ spaceId: s.id, authorId: req.user.sub, description: req.body.description, photos: req.body.photos })
    return reply.code(201).send((await loadDetail(s.id))!)
  })

  // Gestor da prefeitura (ou admin) atualiza o status do espaço
  app.patch('/spaces/:id/status', {
    onRequest: requireRole('gestor'),
    schema: {
      params: z.object({ id: z.uuid() }),
      body: z.object({ status: z.enum(spaceStatus.enumValues) }),
      response: { 200: spaceDetailOut, 404: errorOut },
    },
  }, async (req, reply) => {
    const [s] = await db.update(spaces).set({ status: req.body.status })
      .where(eq(spaces.id, req.params.id)).returning({ id: spaces.id })
    if (!s) return reply.code(404).send({ message: 'Espaço não encontrado' })
    return (await loadDetail(s.id))!
  })
}
