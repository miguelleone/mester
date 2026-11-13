import type { SpaceType } from '../../api'
import { cn } from './cn'

// Paleta das ilustrações em pixel (letra → cor); "." é transparente
const palette: Record<string, string> = {
  k: '#1d1a16', // tinta
  b: '#4a3a2c', // terra escura
  e: '#c9b9a2', // terra clara
  d: '#3e4a1c', // verde escuro
  g: '#5f7029', // verde
  o: '#93a84a', // verde claro
  l: '#cfe03f', // lima
  r: '#f2784b', // laranja (reportado)
  y: '#e2cd5a', // amarelo
  p: '#ff2d87', // rosa
  w: '#79a6d6', // água / vidro
}

// Desenha uma matriz de caracteres como SVG nítido (sem serrilhado)
export function Pixel({ art, className, title }: { art: string[]; className?: string; title?: string }) {
  const h = art.length
  const w = Math.max(...art.map((r) => r.length))
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn('pixelated', className)}
    >
      {art.flatMap((row, y) =>
        [...row].map((c, x) => (c in palette ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={palette[c]} /> : null)),
      )}
    </svg>
  )
}

// Broto: a marca do Mester
export const sprout = [
  '.......ll',
  '..ll..lol',
  '.lool.lg.',
  '.loggl.g.',
  '..ldgg.g.',
  '....dggd.',
  '.....gd..',
  '.....g...',
  '..bbbbbb.',
  '..beeeeb.',
  '...bbbb..',
]

// Um ícone por tipo de espaço
export const spaceArt: Record<SpaceType, string[]> = {
  praca: [
    '....oooo....',
    '..oogggooo..',
    '.ooggggggoo.',
    '.oggggdgggo.',
    '..ogdggggo..',
    '...oogggo...',
    '.....bb.....',
    '.....bb.....',
    '.kkkkbbkkkk.',
    '.k........k.',
    '.k........k.',
    'gggggggggggg',
  ],
  muro: [
    'eeeeebeeeeeb',
    'eeeeebeeeeeb',
    'bbbbbbbbbbbb',
    'eebeeeeebeee',
    'eebeepeebeee',
    'bbbbpbpbbbbb',
    'eeeepbppeeeb',
    'eeeeebeeeeeb',
    'bbbbbbbbbbbb',
    'eebeeeeebeee',
    'eebeeeeebeee',
    'gggggggggggg',
  ],
  canteiro: [
    '............',
    '..r.....y...',
    '.rlr...yly..',
    '..r..p..y...',
    '..g.plp.g...',
    '..g..p..g...',
    '.ogo.g.ogo..',
    '..g.ogo.g...',
    'bbbbbbbbbbbb',
    'beeeeeeeeeeb',
    'beeeeeeeeeeb',
    'bbbbbbbbbbbb',
  ],
  fachada: [
    '.....kk.....',
    '....keek....',
    '...keeeek...',
    '..keeeeeek..',
    '.kkkkkkkkkk.',
    '.ewweeeewwe.',
    '.ewweeeewwe.',
    '.eeeeeeeeee.',
    '.eyyeebbeee.',
    '.eeeeebbeee.',
    '.eeeeebbeee.',
    'kkkkkkkkkkkk',
  ],
  jardim: [
    '...l....l...',
    '..lol..lol..',
    '...g.ll.g...',
    '.l.gglggg.l.',
    'lol.ggggg.lo',
    '.g.ggpgpgg..',
    '.gggggggggg.',
    '..ggdgggdg..',
    '...ggggggg..',
    '.....dd.....',
    '....dddd....',
    'gggggggggggg',
  ],
}

// Marca: broto em pixel + "Mester" em uncial
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-end gap-1.5', className)}>
      <Pixel art={sprout} className="h-[1.1em] w-auto" />
      <span className="font-display text-[1em] leading-none">Mester</span>
    </span>
  )
}
