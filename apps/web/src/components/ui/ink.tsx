import type { CSSProperties, ReactNode } from 'react'
import { cn } from './cn'

/*
 * Traços feitos "à mão": sublinhado, círculo, risco, seta e visto.
 * Regra do sistema: datilografado é o que o sistema diz; à mão é o que as pessoas dizem,
 * avisos e ênfase. Cada caneta tem um sentido (ver `Pen`).
 */
export type Pen = 'ink' | 'red' | 'blue' | 'green' | 'ochre' | 'marker'

export const penText: Record<Pen, string> = {
  ink: 'text-type-900',
  red: 'text-pen-red',
  blue: 'text-pen-blue',
  green: 'text-pen-green',
  ochre: 'text-pen-ochre',
  marker: 'text-marker',
}

const stroke = {
  fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke',
} as const

const paths = {
  underline: 'M2 7 C 25 4, 55 9, 80 6 S 112 4, 118 7',
  double: 'M2 4 C 30 2, 70 6, 118 3 M6 10 C 40 8, 80 12, 116 9',
  circle: 'M40 8 C 100 -2, 196 6, 197 36 C 198 68, 70 78, 20 62 C -4 52, 4 20, 52 9 L 70 6',
  strike: 'M1 7 C 30 5, 70 8, 119 5',
  box: 'M4 5 C 60 2, 140 4, 196 6 C 198 30, 197 50, 195 75 C 130 78, 60 76, 5 74 C 3 50, 2 30, 6 3',
}
const boxes = {
  underline: { vb: '0 0 120 12', pos: 'left-[-2%] w-[104%] -bottom-[0.32em] h-[0.5em]' },
  double: { vb: '0 0 120 14', pos: 'left-[-2%] w-[104%] -bottom-[0.45em] h-[0.6em]' },
  circle: { vb: '0 0 200 80', pos: '-left-[0.55em] -right-[0.55em] -top-[0.42em] -bottom-[0.42em]' },
  strike: { vb: '0 0 120 12', pos: 'left-[-3%] w-[106%] top-[0.35em] h-[0.5em]' },
  box: { vb: '0 0 200 80', pos: '-left-[0.35em] -right-[0.35em] -top-[0.25em] -bottom-[0.25em]' },
}

type MarkProps = { kind?: keyof typeof paths; pen?: Pen; width?: number; children: ReactNode; className?: string }

// Envolve um trecho com um traço de caneta (o traço é decorativo, o texto continua legível)
export function Mark({ kind = 'underline', pen = 'red', width = 2.2, children, className }: MarkProps) {
  const b = boxes[kind]
  return (
    <span className={cn('relative inline-block whitespace-nowrap', className)}>
      {children}
      <svg aria-hidden viewBox={b.vb} preserveAspectRatio="none" className={cn('pointer-events-none absolute overflow-visible', b.pos, penText[pen])}>
        <path d={paths[kind]} {...stroke} strokeWidth={width} />
      </svg>
    </span>
  )
}

// Seta curva desenhada; gire/espelhe com classes (ex.: -scale-x-100, rotate-90)
export function Arrow({ pen = 'red', className }: { pen?: Pen; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 60" className={cn('w-16 overflow-visible', penText[pen], className)}>
      <path d="M4 54 C 22 54, 52 44, 90 10" {...stroke} strokeWidth={2.2} />
      <path d="M74 9 L 91 8 L 88 25" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

export function Check({ pen = 'blue', className }: { pen?: Pen; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 26" className={cn('size-5 overflow-visible', penText[pen], className)}>
      <path d="M3 14 C 6 16, 9 19, 11 23 C 15 14, 22 6, 30 1" {...stroke} strokeWidth={2.6} />
    </svg>
  )
}

type HandProps = { pen?: Pen; tilt?: number; className?: string; children: ReactNode; as?: 'p' | 'span' }

// Texto à mão (Caveat), levemente torto
export function Hand({ pen = 'blue', tilt = -2, className, children, as: Tag = 'span' }: HandProps) {
  return (
    <Tag
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      className={cn('inline-block rotate-(--tilt) font-hand text-[22px] leading-[1.05] font-semibold', penText[pen], className)}
    >
      {children}
    </Tag>
  )
}

// Marca-texto atrás de um trecho
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return <mark className={cn('marker bg-transparent text-inherit', className)}>{children}</mark>
}

// Fita adesiva segurando um bilhete
export function Tape({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute z-10 h-6 w-24 bg-[rgb(222_216_196/0.72)] shadow-[0_1px_1px_rgb(0_0_0/0.06)]', className)}
      style={{ clipPath: 'polygon(2% 8%, 9% 0, 18% 10%, 30% 2%, 44% 9%, 58% 0, 70% 8%, 84% 1%, 100% 6%, 97% 94%, 86% 100%, 72% 91%, 58% 100%, 42% 92%, 28% 100%, 14% 91%, 0 98%)' }}
    />
  )
}
