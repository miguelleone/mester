import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users, providerProfiles, userRole } from '../db/schema.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { authenticate } from '../auth/guards.js'

// Papéis que qualquer pessoa pode escolher no cadastro; gestor e admin são atribuídos por um admin
const selfServiceRoles = ['morador', 'adotante', 'prestador'] as const

const userOut = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(userRole.enumValues),
})
const sessionOut = z.object({ token: z.string(), user: userOut })
const errorOut = z.object({ message: z.string() })

type UserRow = typeof users.$inferSelect
const toUserOut = (u: UserRow) => ({ id: u.id, name: u.name, email: u.email, role: u.role })

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  const sign = (u: UserRow) => app.jwt.sign({ sub: u.id, role: u.role, name: u.name })

  app.post('/auth/register', {
    schema: {
      body: z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().toLowerCase().pipe(z.email()),
        password: z.string().min(8).max(200),
        role: z.enum(selfServiceRoles).default('morador'),
        provider: z.object({
          crafts: z.array(z.string().trim().min(1)).max(20).default([]),
          region: z.string().trim().max(120).optional(),
          bio: z.string().trim().max(2000).optional(),
        }).optional(),
      }),
      response: { 201: sessionOut, 409: errorOut },
    },
  }, async (req, reply) => {
    const { name, email, password, role, provider } = req.body

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
    if (existing) return reply.code(409).send({ message: 'Email já cadastrado' })

    const passwordHash = await hashPassword(password)
    const user = await db.transaction(async (tx) => {
      const [u] = await tx.insert(users).values({ name, email, passwordHash, role }).returning()
      // Prestador começa com perfil pendente de aprovação
      if (role === 'prestador') {
        await tx.insert(providerProfiles).values({ userId: u!.id, ...provider })
      }
      return u!
    })

    return reply.code(201).send({ token: sign(user), user: toUserOut(user) })
  })

  app.post('/auth/login', {
    schema: {
      body: z.object({
        email: z.string().trim().toLowerCase(),
        password: z.string().min(1),
      }),
      response: { 200: sessionOut, 401: errorOut },
    },
  }, async (req, reply) => {
    const { email, password } = req.body
    const [user] = await db.select().from(users).where(eq(users.email, email))
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ message: 'Email ou senha inválidos' })
    }
    return { token: sign(user), user: toUserOut(user) }
  })

  app.get('/auth/me', {
    preHandler: authenticate,
    schema: { response: { 200: userOut, 404: errorOut } },
  }, async (req, reply) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.sub))
    if (!user) return reply.code(404).send({ message: 'Usuário não encontrado' })
    return toUserOut(user)
  })
}
