import { useEffect, useMemo, useRef, useState } from 'react'
import type { SpaceStatus } from '../../api'
import { cn } from './cn'
import { statusBg } from './Status'

/*
 * Mapa ilustrativo em ASCII, inspirado no centro do Recife: rios, mar, praia, avenidas,
 * ruas de bairro, quadras cheias de prédios, árvores, parques e nomes de bairro.
 * Serve para o showcase, estados vazios e ilustrações; o mapa real usa a camada ASCII sobre os tiles.
 */
type Pin = { x: number; y: number; n: number; status: SpaceStatus }
type P = [number, number]

const rivers: { pts: P[]; w: number }[] = [
  { pts: [[0, 0.66], [0.12, 0.6], [0.26, 0.69], [0.4, 0.64], [0.5, 0.55], [0.6, 0.47], [0.7, 0.5], [0.8, 0.58], [0.93, 0.62]], w: 0.03 },
  { pts: [[0.55, 0], [0.6, 0.14], [0.66, 0.29], [0.7, 0.42], [0.71, 0.49]], w: 0.018 },
  { pts: [[0.1, 1], [0.22, 0.86], [0.3, 0.82], [0.42, 0.85], [0.5, 1]], w: 0.012 },
]
// Avenidas principais (traço pesado)
const avenues: P[][] = [
  [[0, 0.34], [0.3, 0.36], [0.66, 0.39], [0.88, 0.37]],
  [[0.36, 0], [0.38, 0.46], [0.34, 1]],
  [[0, 0.15], [0.5, 0.12], [1, 0.09]],
  [[0.46, 1], [0.62, 0.8], [0.88, 0.68]],
]
// Ruas secundárias (traço fino)
const streets: P[][] = [
  [[0.1, 0.95], [0.2, 0.75], [0.12, 0.45], [0.18, 0]],
  [[0.6, 0.3], [0.78, 0.22], [0.86, 0.04]],
  [[0.5, 0.12], [0.52, 0.36]],
  [[0.24, 0.36], [0.27, 0.58]],
  [[0.66, 0.39], [0.76, 0.5]],
  [[0.62, 0.8], [0.66, 0.6], [0.78, 0.56]],
  [[0, 0.5], [0.2, 0.52], [0.38, 0.5]],
  [[0.78, 0.22], [0.88, 0.3], [0.88, 0.37]],
  [[0.38, 0.82], [0.6, 0.9], [0.86, 0.86]],
]
const parks: [number, number, number][] = [[0.46, 0.42, 0.04], [0.64, 0.24, 0.026], [0.2, 0.24, 0.05], [0.56, 0.86, 0.035], [0.82, 0.78, 0.025]]
const labels: { x: number; y: number; t: string; major?: boolean }[] = [
  { x: 0.44, y: 0.28, t: 'BOA VISTA', major: true },
  { x: 0.62, y: 0.17, t: 'SANTO AMARO' },
  { x: 0.25, y: 0.3, t: 'DERBY' },
  { x: 0.16, y: 0.07, t: 'GRAÇAS' },
  { x: 0.8, y: 0.45, t: 'RECIFE ANTIGO', major: true },
  { x: 0.7, y: 0.74, t: 'SÃO JOSÉ' },
  { x: 0.2, y: 0.78, t: 'ILHA DO LEITE' },
  { x: 0.33, y: 0.61, t: '~ CAPIBARIBE ~', major: true },
  { x: 0.56, y: 0.355, t: 'AV. CONDE DA BOA VISTA' },
]

function distToSeg(px: number, py: number, [ax, ay]: P, [bx, by]: P) {
  const dx = bx - ax, dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
function nearest(x: number, y: number, pts: P[], aspect: number) {
  let best = 0, bd = Infinity
  pts.slice(1).forEach((b, i) => {
    const d = distToSeg(x, y * aspect, [pts[i][0], pts[i][1] * aspect], [b[0], b[1] * aspect])
    if (d < bd) { bd = d; best = i }
  })
  return { d: bd, a: pts[best], b: pts[best + 1] }
}
// Direção da via → caractere de linha (pesado para avenidas, fino para ruas)
function lineChar(a: P, b: P, aspect: number, heavy: boolean) {
  const deg = ((Math.atan2((b[1] - a[1]) * aspect, b[0] - a[0]) * 180) / Math.PI + 180) % 180
  if (deg < 22 || deg > 158) return heavy ? '━' : '─'
  if (deg > 68 && deg < 112) return heavy ? '┃' : '│'
  return deg < 90 ? (heavy ? '\\' : '╲') : heavy ? '/' : '╱'
}
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

type Cell = { c: string; k: string }
const cls: Record<string, string> = {
  sea: 'text-water/80', water: 'text-water', beach: 'text-earth-500', park: 'text-olive-600', tree: 'text-olive-400',
  avenue: 'text-ink-1 font-bold', street: 'text-ink-2', bridge: 'text-earth-700 font-bold',
  b1: 'text-[#bdb6a6]', b2: 'text-[#d3cdbf]', b3: 'text-earth-500/70', lane: 'text-[#cfc9bb]',
  label: 'text-ink-1 font-bold bg-paper-2',
}
const dense = '##%@&▓#=%#'
const light = '=+:;=-'

// Proporção da célula: largura ≈ 0,57 do corpo (com tracking negativo), altura = 1,05 do corpo
const CW = 0.57, LH = 1.05

export function AsciiMap({ rows = 36, size = 10, pins = [], className, label = 'Mapa ilustrativo do centro do Recife' }: {
  rows?: number; size?: number; pins?: Pin[]; className?: string; label?: string
}) {
  // Colunas se ajustam à largura disponível
  const ref = useRef<HTMLPreElement>(null)
  const [cols, setCols] = useState(60)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setCols(Math.max(20, Math.floor(el.clientWidth / (size * CW)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [size])

  const grid = useMemo(() => {
    const aspect = (rows * LH) / (cols * CW)
    const g: Cell[][] = []
    for (let r = 0; r < rows; r++) {
      const line: Cell[] = []
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) / cols, y = (r + 0.5) / rows
        const coast = 0.9 + 0.025 * Math.sin(y * 9)
        const water = rivers.some((rv) => nearest(x, y, rv.pts, aspect).d < rv.w)
        const av = avenues.map((p) => nearest(x, y, p, aspect)).find((n) => n.d < 0.55 / cols)
        const st = streets.map((p) => nearest(x, y, p, aspect)).find((n) => n.d < 0.5 / cols)
        const park = parks.some(([px, py, pr]) => Math.hypot(x - px, (y - py) * aspect) < pr)
        const h = hash(c, r)
        // quadras de tamanhos variados por região
        const region = hash(Math.floor(c / 14), Math.floor(r / 7))
        const bw = 4 + Math.floor(region * 4), bh = 2 + Math.floor(region * 2)
        let cell: Cell
        if (x > coast) cell = { c: (r + c) % 4 ? '≈' : '~', k: 'sea' }
        else if (x > coast - 1.6 / cols) cell = { c: h > 0.5 ? '.' : ':', k: 'beach' }
        else if ((av || st) && water) cell = { c: '═', k: 'bridge' }
        else if (water) cell = { c: h > 0.75 ? '≈' : '~', k: 'water' }
        else if (av) cell = { c: lineChar(av.a, av.b, aspect, true), k: 'avenue' }
        else if (st) cell = { c: lineChar(st.a, st.b, aspect, false), k: 'street' }
        else if (park) cell = { c: h > 0.6 ? '♣' : h > 0.3 ? '"' : ';', k: h > 0.6 ? 'tree' : 'park' }
        else if (c % bw === 0 || r % bh === 0) cell = { c: c % bw === 0 && r % bh === 0 ? '+' : c % bw === 0 ? ':' : '·', k: 'lane' }
        else if (h < 0.05) cell = { c: '♣', k: 'tree' }
        else if (region > 0.55) cell = { c: dense[Math.floor(h * dense.length)], k: h > 0.5 ? 'b1' : 'b3' }
        else cell = { c: h > 0.35 ? dense[Math.floor(h * dense.length)] : light[Math.floor(h * 2 * light.length) % light.length], k: h > 0.6 ? 'b1' : 'b2' }
        line.push(cell)
      }
      g.push(line)
    }
    // Nomes de bairro (no celular, só os principais)
    for (const l of labels) {
      if (!l.major && cols < 70) continue
      const txt = ` ${l.t} `
      const r = Math.round(l.y * (rows - 1)), c0 = Math.round(l.x * (cols - 1) - txt.length / 2)
      if (c0 < 0 || c0 + txt.length > cols) continue
      ;[...txt].forEach((ch, i) => { if (g[r]?.[c0 + i]) g[r][c0 + i] = { c: ch, k: 'label' } })
    }
    // Pinos: [01] sobre a cor do status
    for (const p of pins) {
      const r = Math.round(p.y * (rows - 1)), c0 = Math.round(p.x * (cols - 1)) - 2
      const txt = `[${String(p.n).padStart(2, '0')}]`
      ;[...txt].forEach((ch, i) => { if (g[r]?.[c0 + i]) g[r][c0 + i] = { c: ch, k: `pin:${p.status}` } })
    }
    return g
  }, [cols, rows, pins])

  return (
    <pre
      ref={ref}
      role="img"
      aria-label={label}
      style={{ fontSize: size, lineHeight: LH, letterSpacing: `${CW - 0.6}em` }}
      className={cn('w-full overflow-hidden font-mono select-none', className)}
    >
      {grid.map((line, r) => {
        // agrupa caracteres vizinhos da mesma classe em um só span
        const runs: Cell[] = []
        for (const cell of line) {
          const last = runs[runs.length - 1]
          if (last && last.k === cell.k) last.c += cell.c
          else runs.push({ ...cell })
        }
        return (
          <div key={r}>
            {runs.map((run, i) => {
              const pin = run.k.startsWith('pin:') ? (run.k.slice(4) as SpaceStatus) : null
              return <span key={i} className={pin ? cn(statusBg[pin], 'font-bold text-ink-1') : cls[run.k]}>{run.c}</span>
            })}
          </div>
        )
      })}
    </pre>
  )
}
