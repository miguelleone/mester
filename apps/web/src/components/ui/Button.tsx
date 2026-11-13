import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'link' | 'danger'
type Size = 'sm' | 'md'

// Pílulas compactas: sem borda, cor chapada
const variants: Record<Variant, string> = {
  primary: 'bg-ink-1 text-paper enabled:hover:bg-olive-800',
  secondary: 'bg-paper-2 text-ink-1 enabled:hover:bg-hl',
  // Link entre colchetes: [ ver proposta ]
  link: 'text-ink-1 enabled:hover:bg-hl rounded-sm px-0.5',
  danger: 'bg-[#f3e4dc] text-alert enabled:hover:bg-alert enabled:hover:text-paper',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1',
  md: 'h-8 px-3 text-[12.5px] gap-1.5',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  block?: boolean
  /** caractere à esquerda, ex.: "+", "→" */
  glyph?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, block, glyph, className, children, disabled, ...rest }: ButtonProps) {
  const isLink = variant === 'link'
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-mono font-medium whitespace-nowrap transition-colors select-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        isLink ? 'h-7 text-[12.5px]' : cn('rounded-full', sizes[size]),
        variants[variant], block && 'w-full', className,
      )}
    >
      {isLink && <span aria-hidden className="text-ink-3">[</span>}
      {loading ? <Spinner className="w-[1ch]" /> : glyph && <span aria-hidden>{glyph}</span>}
      <span className={cn(isLink && 'px-1 underline decoration-ink-3 underline-offset-2')}>{children}</span>
      {isLink && <span aria-hidden className="text-ink-3">]</span>}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; glyph: string }

// Botão redondo de um caractere (×, ↓); o label vira aria-label e title
export function IconButton({ label, glyph, className, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[14px] text-ink-2 transition-colors hover:bg-hl hover:text-ink-1', className)}
    >
      <span aria-hidden>{glyph}</span>
    </button>
  )
}
