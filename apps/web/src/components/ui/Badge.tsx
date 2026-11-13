import type { ReactNode } from 'react'
import { statusLabel, type SpaceStatus } from '../../api'
import { cn } from './cn'

export type Tone = 'neutral' | 'moss' | 'ochre' | 'terracotta' | 'river'

const tones: Record<Tone, { box: string; dot: string }> = {
  neutral: { box: 'bg-sunken text-ink-700', dot: 'bg-ink-500' },
  moss: { box: 'bg-moss-100 text-moss-800', dot: 'bg-moss-500' },
  ochre: { box: 'bg-ochre-100 text-ochre-700', dot: 'bg-ochre-500' },
  terracotta: { box: 'bg-terracotta-100 text-terracotta-700', dot: 'bg-terracotta-500' },
  river: { box: 'bg-river-100 text-river-700', dot: 'bg-river-500' },
}

export function Badge({ tone = 'neutral', dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap', tones[tone].box)}>
      {dot && <span aria-hidden className={cn('size-1.5 rounded-full', tones[tone].dot)} />}
      {children}
    </span>
  )
}

// Cada etapa da jornada de um espaço tem uma cor fixa (mapa, badge e régua usam a mesma)
export const statusTone: Record<SpaceStatus, Tone> = {
  reportado: 'terracotta',
  com_proposta: 'ochre',
  em_obra: 'river',
  adotado: 'moss',
}

export function StatusBadge({ status }: { status: SpaceStatus }) {
  return <Badge tone={statusTone[status]} dot>{statusLabel[status]}</Badge>
}

const steps = Object.keys(statusLabel) as SpaceStatus[]

// Régua de progresso: reportado → com proposta → em obra → adotado
export function StatusSteps({ status }: { status: SpaceStatus }) {
  const current = steps.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label={`Etapa atual: ${statusLabel[status]}`}>
      {steps.map((st, i) => (
        <li key={st} aria-current={i === current ? 'step' : undefined} className="flex flex-col gap-1.5">
          <span className={cn('h-1.5 rounded-full', i <= current ? tones[statusTone[status]].dot : 'bg-line')} />
          <span className={cn('text-[12px] leading-tight', i === current ? 'font-semibold text-ink-900' : 'text-ink-500')}>
            {statusLabel[st]}
          </span>
        </li>
      ))}
    </ol>
  )
}
