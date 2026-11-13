import type { ReactNode } from 'react'
import { statusLabel, type SpaceStatus } from '../../api'
import { cn } from './cn'

// Cada etapa da jornada tem uma faixa de cor chapada (texto escuro por cima)
export const statusBg: Record<SpaceStatus, string> = {
  reportado: 'bg-st-reportado',
  com_proposta: 'bg-st-proposta',
  em_obra: 'bg-st-obra',
  adotado: 'bg-st-adotado',
}
// Mesmas cores em hex, para o mapa (Leaflet não lê classes)
export const statusHex: Record<SpaceStatus, string> = {
  reportado: '#f2784b',
  com_proposta: '#e2cd5a',
  em_obra: '#79a6d6',
  adotado: '#9bb85c',
}
const short: Record<SpaceStatus, string> = { reportado: 'reportado', com_proposta: 'proposta', em_obra: 'obra', adotado: 'adotado' }
const steps = Object.keys(statusLabel) as SpaceStatus[]

export function StatusTag({ status, className }: { status: SpaceStatus; className?: string }) {
  return (
    <span className={cn('inline-flex h-5 items-center px-1.5 text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-ink-1 uppercase', statusBg[status], className)}>
      {statusLabel[status]}
    </span>
  )
}

// Jornada em linha: [■ reportado]──[■ proposta]──[□ obra]──[□ adotado]
export function StatusPath({ status, className }: { status: SpaceStatus; className?: string }) {
  const current = steps.indexOf(status)
  return (
    <ol aria-label={`Etapa atual: ${statusLabel[status]}`} className={cn('flex flex-wrap items-center gap-y-1 text-[12px]', className)}>
      {steps.map((st, i) => (
        <li key={st} aria-current={i === current ? 'step' : undefined} className="flex items-center">
          {i > 0 && <span aria-hidden className={cn('w-3 border-t', i <= current ? 'border-ink-1' : 'border-dashed border-ink-3')} />}
          <span
            className={cn(
              'px-1.5 py-px',
              i < current && cn(statusBg[st], 'text-ink-1'),
              i === current && 'bg-ink-1 text-paper',
              i > current && 'border border-dashed border-ink-3 text-ink-3',
            )}
          >
            <span aria-hidden>{i < current ? '■ ' : i === current ? '▸ ' : '□ '}</span>
            {short[st]}
          </span>
        </li>
      ))}
    </ol>
  )
}

type BandProps = {
  n: number
  title: ReactNode
  status?: SpaceStatus
  open?: boolean
  onToggle?: () => void
  children?: ReactNode
  dark?: boolean
}

// Faixa numerada de cor chapada (lista de espaços). Abre para mostrar detalhes.
export function Band({ n, title, status, open, onToggle, children, dark }: BandProps) {
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-left transition-[filter] hover:brightness-95',
          dark ? 'bg-ink-1 text-paper' : status ? cn(statusBg[status], 'text-ink-1') : 'bg-paper-2',
        )}
      >
        <sup className="w-5 shrink-0 font-mono text-[10px]">{String(n).padStart(2, '0')}</sup>
        <span className="min-w-0 flex-1 truncate font-display text-[17px] leading-tight">{title}</span>
        <span aria-hidden className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-transform', dark ? 'border-paper' : 'border-ink-1', open && 'rotate-180')}>↓</span>
      </button>
      {open && children && <div className="animate-rise bg-paper px-3 py-3 pl-10">{children}</div>}
    </div>
  )
}
