import { cn } from './cn'
import { Hand, Mark } from './ink'

// Marca: MESTER datilografado, sublinhado à caneta, com o subtítulo anotado à mão
export function Logo({ tagline, className }: { tagline?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-end gap-2', className)}>
      <span className="font-type text-[22px] leading-none font-bold tracking-[0.22em] text-type-900">
        <Mark kind="underline" pen="red" width={2.6}>MESTER</Mark>
      </span>
      {tagline && <Hand pen="blue" tilt={-4} className="-mb-1 text-[19px]">cuidado urbano</Hand>}
    </span>
  )
}
