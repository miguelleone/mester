import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Tape } from './ink'

type SheetProps = HTMLAttributes<HTMLDivElement> & {
  /** inclinação em graus; módulos soltos ficam levemente tortos */
  tilt?: number
  /** fita adesiva no topo */
  tape?: 'left' | 'center' | 'right'
  paper?: 'plain' | 'ruled' | 'grid'
  padding?: 'none' | 'sm' | 'md'
  lifted?: boolean
}

const tapePos = {
  left: '-top-3 left-4 -rotate-6',
  center: '-top-3 left-1/2 -translate-x-1/2 rotate-2',
  right: '-top-3 right-4 rotate-6',
}

// Folha de papel colada na página: o "cartão" do sistema
export function Sheet({ tilt = 0, tape, paper = 'plain', padding = 'md', lifted, className, style, children, ...rest }: SheetProps) {
  return (
    <div
      {...rest}
      style={{ '--tilt': `${tilt}deg`, ...style } as CSSProperties}
      className={cn(
        'relative rotate-(--tilt) border border-rule/70 bg-paper',
        lifted ? 'shadow-lifted' : 'shadow-sheet',
        paper === 'ruled' && 'ruled', paper === 'grid' && 'grid-paper',
        padding === 'sm' && 'p-3', padding === 'md' && 'p-5 sm:p-6',
        className,
      )}
    >
      {tape && <Tape className={tapePos[tape]} />}
      {children}
    </div>
  )
}

// Foto colada com borda branca, como recorte no caderno
export function Snapshot({ src, alt, tilt = 0, className, children }: { src?: string; alt?: string; tilt?: number; className?: string; children?: ReactNode }) {
  return (
    <figure style={{ '--tilt': `${tilt}deg` } as CSSProperties} className={cn('rotate-(--tilt) bg-paper p-1.5 shadow-sheet', className)}>
      {src ? <img src={src} alt={alt ?? ''} loading="lazy" className="aspect-square w-full object-cover" /> : children}
    </figure>
  )
}

// Etiqueta datilografada (tipo de espaço, papel do usuário)
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center border border-type-900 px-1.5 text-[12px] font-bold tracking-[0.1em] whitespace-nowrap uppercase', className)}>
      {children}
    </span>
  )
}
