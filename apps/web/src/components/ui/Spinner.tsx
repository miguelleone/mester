import { cn } from './cn'

// Reticências de máquina de escrever: "." ".." "..."
export function Spinner({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex w-[1.6em] gap-[0.15em]', className)}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 180}ms` }}>.</span>
      ))}
    </span>
  )
}
