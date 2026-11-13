import type { ReactNode } from 'react'
import { cn } from './cn'
import { IconButton } from './Button'
import { CloseIcon } from './icons'

type PanelProps = {
  title: ReactNode
  eyebrow?: ReactNode
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

// Painel sobre o mapa: folha que sobe de baixo no celular, coluna lateral no desktop
export function Panel({ title, eyebrow, onClose, children, footer, className }: PanelProps) {
  return (
    <section
      className={cn(
        'flex max-h-[70dvh] flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-overlay animate-sheet-in',
        'md:max-h-none md:rounded-xl',
        className,
      )}
    >
      <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong md:hidden" />
      <header className="flex shrink-0 items-start gap-2 px-5 pt-3 pb-3 md:pt-5">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="mb-1 text-[12px] font-semibold tracking-wider text-ink-500 uppercase">{eyebrow}</p>}
          <h2 className="text-[22px] leading-tight font-semibold text-ink-900">{title}</h2>
        </div>
        {onClose && (
          <IconButton label="Fechar" size="sm" onClick={onClose} className="-mt-1 -mr-2">
            <CloseIcon />
          </IconButton>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      {footer && <footer className="shrink-0 border-t border-line bg-paper px-5 py-3">{footer}</footer>}
    </section>
  )
}
