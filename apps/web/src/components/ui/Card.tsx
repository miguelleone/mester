import type { HTMLAttributes } from 'react'
import { cn } from './cn'

type CardProps = HTMLAttributes<HTMLDivElement> & { padding?: 'none' | 'sm' | 'md'; interactive?: boolean }

export function Card({ padding = 'md', interactive, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-lg border border-line bg-surface shadow-card',
        padding === 'sm' && 'p-3', padding === 'md' && 'p-4 sm:p-5',
        interactive && 'transition-shadow hover:shadow-raised',
        className,
      )}
    />
  )
}
