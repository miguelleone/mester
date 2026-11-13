import { statusLabel, type SpaceStatus } from '../../api'
import { cn } from './cn'
import { Check, Mark, penText, type Pen } from './ink'

// Cada etapa da jornada tem uma caneta: vermelho = problema, ocre = proposta, azul = obra, verde = cuidado
export const statusPen: Record<SpaceStatus, Pen> = {
  reportado: 'red',
  com_proposta: 'ochre',
  em_obra: 'blue',
  adotado: 'green',
}

const steps = Object.keys(statusLabel) as SpaceStatus[]

// Status circulado à caneta
export function StatusMark({ status, className }: { status: SpaceStatus; className?: string }) {
  return (
    <span className={cn('inline-block px-3 py-1.5 text-[12px] font-bold tracking-[0.1em] uppercase', penText[statusPen[status]], className)}>
      <Mark kind="circle" pen={statusPen[status]} width={1.8}>{statusLabel[status]}</Mark>
    </span>
  )
}

// Jornada como lista datilografada: etapas feitas ganham visto, a atual é circulada
export function StatusSteps({ status, className }: { status: SpaceStatus; className?: string }) {
  const current = steps.indexOf(status)
  const pen = statusPen[status]
  return (
    <ol aria-label={`Etapa atual: ${statusLabel[status]}`} className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[14px]', className)}>
      {steps.map((st, i) => (
        <li key={st} aria-current={i === current ? 'step' : undefined} className="flex items-center gap-2.5">
          {i < current && (
            <span className="relative pr-2 text-type-600">
              {statusLabel[st].toLowerCase()}
              <Check pen={pen} className="absolute -top-3 -right-2.5 size-5" />
            </span>
          )}
          {i === current && (
            <span className={cn('px-2.5 py-1 font-bold', penText[pen])}>
              <Mark kind="circle" pen={pen} width={2}>{statusLabel[st].toLowerCase()}</Mark>
            </span>
          )}
          {i > current && <span className="text-type-400">{statusLabel[st].toLowerCase()}</span>}
          {i < steps.length - 1 && <span aria-hidden className="text-type-400">→</span>}
        </li>
      ))}
    </ol>
  )
}
