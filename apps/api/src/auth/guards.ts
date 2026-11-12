import type { FastifyReply, FastifyRequest } from 'fastify'
import type { userRole } from '../db/schema.js'

export type Role = (typeof userRole.enumValues)[number]
export type AuthUser = { sub: string; role: Role; name: string }

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser
    user: AuthUser
  }
}

// preHandler: exige token válido no header Authorization: Bearer <token>
export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.code(401).send({ message: 'Não autenticado' })
  }
}

// preHandler: exige um dos papéis informados (admin sempre passa)
export function requireRole(...roles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    await authenticate(req, reply)
    if (reply.sent) return
    if (req.user.role !== 'admin' && !roles.includes(req.user.role)) {
      return reply.code(403).send({ message: 'Sem permissão' })
    }
  }
}
