import { cn } from './cn'

// Florão de iluminura simplificado: o toque artesanal da marca
export function Fleuron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-6', className)} fill="currentColor">
      <path d="M16 3c2.6 3 3.4 6.2 2.2 9.3 3.2-1.6 6.5-1.3 9.8.9-3 2.9-6.3 3.9-9.5 2.9 1.9 2.7 2.2 6 .8 9.7-2.4-1.5-3.8-3.6-4.3-6.3-.5 2.7-1.9 4.8-4.3 6.3-1.4-3.7-1.1-7 .8-9.7-3.2 1-6.5 0-9.5-2.9 3.3-2.2 6.6-2.5 9.8-.9C12.6 9.2 13.4 6 16 3z" />
      <circle cx="16" cy="28" r="1.6" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-moss-700', className)}>
      <Fleuron className="size-6" />
      <span className="font-display text-[26px] leading-none font-semibold tracking-tight text-ink-900">Mester</span>
    </span>
  )
}

// Divisor ornamental para momentos especiais (espaço adotado, placa, conclusão)
export function Ornament({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-center gap-3 text-ochre-500', className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-ochre-500/60" />
      <Fleuron className="size-5" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-ochre-500/60" />
    </div>
  )
}
