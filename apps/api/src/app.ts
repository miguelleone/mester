import Fastify from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { spacesRoutes } from './routes/spaces.js'

export function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, { origin: true })
  app.get('/health', async () => ({ status: 'ok' }))
  app.register(spacesRoutes)

  return app
}
