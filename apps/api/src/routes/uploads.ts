import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { env } from '../env.js'
import { authenticate } from '../auth/guards.js'

const MAX_BYTES = 5 * 1024 * 1024

// Reconhece o formato pelos primeiros bytes, sem confiar no content-type enviado
function detectImage(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

// Caminho que os reportes guardam para cada foto enviada por POST /uploads
export const photoPath = z.string().regex(/^\/uploads\/[\w-]+\.(jpg|png|webp)$/, 'Foto inválida')

export const uploadsRoutes: FastifyPluginAsyncZod = async (app) => {
  await mkdir(env.uploadsDir, { recursive: true })
  await app.register(multipart, { limits: { fileSize: MAX_BYTES, files: 1 } })
  await app.register(fastifyStatic, { root: env.uploadsDir, prefix: '/uploads/', decorateReply: false })

  // Envia uma foto (campo "file") e devolve o caminho para usar em `photos`
  app.post('/uploads', {
    onRequest: authenticate,
    schema: { response: { 201: z.object({ url: z.string() }), 400: z.object({ message: z.string() }) } },
  }, async (req, reply) => {
    const file = await req.file().catch(() => undefined)
    if (!file) return reply.code(400).send({ message: 'Envie uma imagem no campo "file"' })
    const buf = await file.toBuffer().catch(() => null)
    if (!buf) return reply.code(400).send({ message: 'A imagem pode ter no máximo 5 MB' })
    const ext = detectImage(buf)
    if (!ext) return reply.code(400).send({ message: 'Formato não suportado (use JPG, PNG ou WebP)' })
    const name = `${randomUUID()}.${ext}`
    await writeFile(join(env.uploadsDir, name), buf)
    return reply.code(201).send({ url: `/uploads/${name}` })
  })
}
