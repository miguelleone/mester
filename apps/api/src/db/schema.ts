import {
  pgTable, pgEnum, uuid, text, timestamp, boolean, integer, geometry, date, primaryKey,
} from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['morador', 'adotante', 'prestador', 'admin'])
export const spaceType = pgEnum('space_type', ['praca', 'muro', 'canteiro', 'fachada', 'jardim'])
export const spaceStatus = pgEnum('space_status', ['reportado', 'com_proposta', 'em_obra', 'adotado'])
export const proposalStatus = pgEnum('proposal_status', ['rascunho', 'publicada', 'adotada', 'cancelada'])
export const adoptionStatus = pgEnum('adoption_status', ['interesse', 'ativa', 'encerrada'])
export const workStatus = pgEnum('work_status', ['planejada', 'em_andamento', 'concluida'])
export const workPhase = pgEnum('work_phase', ['antes', 'durante', 'depois'])
export const providerStatus = pgEnum('provider_status', ['pendente', 'aprovado', 'recusado'])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull().default('morador'),
  ...timestamps,
})

export const providerProfiles = pgTable('provider_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  crafts: text('crafts').array().notNull().default([]),
  region: text('region'),
  bio: text('bio'),
  status: providerStatus('status').notNull().default('pendente'),
  ...timestamps,
})

export const spaces = pgTable('spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: spaceType('type').notNull(),
  location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  isPublic: boolean('is_public').notNull().default(true),
  status: spaceStatus('status').notNull().default('reportado'),
  ...timestamps,
})

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => spaces.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  description: text('description').notNull(),
  photos: text('photos').array().notNull().default([]),
  ...timestamps,
})

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  spaceId: uuid('space_id').notNull().references(() => spaces.id, { onDelete: 'cascade' }),
  scope: text('scope').notNull(),
  budgetCents: integer('budget_cents').notNull(),
  deadlineDays: integer('deadline_days').notNull(),
  status: proposalStatus('status').notNull().default('rascunho'),
  ...timestamps,
})

export const adoptions = pgTable('adoptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull().references(() => proposals.id),
  adopterId: uuid('adopter_id').notNull().references(() => users.id),
  startsOn: date('starts_on'),
  endsOn: date('ends_on'),
  status: adoptionStatus('status').notNull().default('interesse'),
  ...timestamps,
})

export const works = pgTable('works', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull().references(() => proposals.id),
  status: workStatus('status').notNull().default('planejada'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  ...timestamps,
})

export const workProviders = pgTable('work_providers', {
  workId: uuid('work_id').notNull().references(() => works.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').notNull().references(() => providerProfiles.userId),
}, (t) => [primaryKey({ columns: [t.workId, t.providerId] })])

export const workEntries = pgTable('work_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  workId: uuid('work_id').notNull().references(() => works.id, { onDelete: 'cascade' }),
  phase: workPhase('phase').notNull(),
  photos: text('photos').array().notNull().default([]),
  note: text('note'),
  ...timestamps,
})
