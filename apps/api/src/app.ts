import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { env } from './env.js'
import { authRoutes } from './routes/auth.js'
import { spacesRoutes } from './routes/spaces.js'
import { uploadsRoutes } from './routes/uploads.js'

export function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, { origin: true })
  app.register(jwt, { secret: env.jwtSecret, sign: { expiresIn: '7d' } })

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(authRoutes)
  app.register(spacesRoutes)
  app.register(uploadsRoutes)

  return app
}
