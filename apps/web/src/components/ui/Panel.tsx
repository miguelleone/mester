import type { ReactNode } from 'react'
import { cn } from './cn'
import { CloseMark, IconButton } from './Button'
import { Tape } from './ink'

type PanelProps = {
  title: ReactNode
  eyebrow?: ReactNode
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Bilhete colado sobre o mapa: folha que sobe de baixo no celular, folha solta e torta no desktop
export function Panel({ title, eyebrow, onClose, children, footer, className }: PanelProps) {
  return (
    <section
      className={cn(
        'relative flex max-h-[72dvh] flex-col border border-rule/70 bg-paper shadow-lifted animate-drop-in',
        'md:max-h-none md:rotate-[-0.6deg] md:[--tilt:-0.6deg]',
        className,
      )}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
      <header className="flex shrink-0 items-start gap-2 px-5 pt-5 pb-3 sm:px-6">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="mb-1 text-[12px] font-bold tracking-[0.12em] text-type-600 uppercase">{eyebrow}</p>}
          <h2 className="text-[22px] leading-tight">{title}</h2>
        </div>
        {onClose && (
          <IconButton label="Fechar" size="sm" onClick={onClose} className="-mt-1 -mr-2">
            <CloseMark />
          </IconButton>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
      {footer && <footer className="shrink-0 border-t border-dashed border-type-400 px-5 py-3 sm:px-6">{footer}</footer>}
    </section>
  )
}
