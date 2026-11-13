import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

// Ao passar o mouse, o botão "levanta" e deixa um rastro de marca-texto
const lift = 'enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5 enabled:hover:shadow-ink enabled:active:translate-0 enabled:active:shadow-none'

const variants: Record<Variant, string> = {
  primary: cn('bg-type-900 text-paper border-2 border-type-900', lift),
  secondary: cn('bg-paper text-type-900 border-2 border-type-900', lift),
  ghost: 'text-type-900 underline decoration-1 underline-offset-[6px] hover:decoration-marker hover:decoration-[3px]',
  danger: cn('bg-paper text-pen-red border-2 border-pen-red', 'enabled:hover:bg-pen-red enabled:hover:text-paper'),
}

// md e lg têm 44px+ de altura: alvo de toque confortável no celular
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-[15px] gap-2',
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
        'inline-flex items-center justify-center font-type font-bold tracking-[0.08em] uppercase transition-[transform,box-shadow,background-color,color] duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant !== 'ghost' && sizes[size], variant === 'ghost' && 'h-11 px-1 text-sm',
        variants[variant], block && 'w-full', className,
      )}
    >
      {icon}
      {children}
      {loading && <Spinner />}
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
        'inline-flex shrink-0 items-center justify-center text-type-600 transition-colors hover:bg-paper-2 hover:text-type-900',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
    >
      {children}
    </button>
  )
}

// "×" escrito à mão, para fechar folhas e avisos
export function CloseMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn('font-hand text-[30px] leading-none', className)}>×</span>
}
