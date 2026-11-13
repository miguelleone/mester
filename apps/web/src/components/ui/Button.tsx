import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-moss-700 text-white shadow-card hover:bg-moss-800 active:bg-moss-800',
  secondary: 'border border-line-strong bg-surface text-ink-900 shadow-card hover:bg-sunken',
  ghost: 'text-ink-700 hover:bg-sunken',
  danger: 'bg-terracotta-700 text-white shadow-card hover:bg-terracotta-500',
}

// md e lg têm 44px+ de altura: alvo de toque confortável no celular
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-[15px] gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  block?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, block, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors select-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant], sizes[size], block && 'w-full', className,
      )}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: 'sm' | 'md' }

// Botão só com ícone; o label vira aria-label e title
export function IconButton({ label, size = 'md', className, children, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
    >
      {children}
    </button>
  )
}
