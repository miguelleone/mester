import { useEffect, useMemo, useRef, useState } from 'react'
import type { SpaceStatus } from '../../api'
import { cn } from './cn'
import { statusBg } from './Status'

/*
 * Mapa ilustrativo em ASCII, inspirado no centro do Recife (rios, mar, avenidas, parques).
 * Serve para o showcase, estados vazios e ilustrações; o mapa real usa a camada ASCII sobre os tiles.
 */
type Pin = { x: number; y: number; n: number; status: SpaceStatus }
type P = [number, number]

const rivers: { pts: P[]; w: number }[] = [
  { pts: [[0, 0.64], [0.14, 0.58], [0.28, 0.67], [0.42, 0.62], [0.52, 0.52], [0.6, 0.44], [0.7, 0.47], [0.8, 0.56], [0.92, 0.6]], w: 0.035 },
  { pts: [[0.55, 0], [0.6, 0.14], [0.66, 0.28], [0.7, 0.4], [0.71, 0.46]], w: 0.022 },
]
const roads: P[][] = [
  [[0.02, 0.33], [0.3, 0.35], [0.66, 0.38], [0.86, 0.36]],
  [[0.36, 0], [0.38, 0.45], [0.34, 1]],
  [[0, 0.16], [0.5, 0.12], [1, 0.1]],
  [[0.48, 1], [0.62, 0.8], [0.84, 0.66]],
  [[0.1, 0.95], [0.2, 0.75], [0.12, 0.45], [0.18, 0]],
  [[0.6, 0.3], [0.78, 0.22], [0.86, 0.05]],
]
const parks: [number, number, number][] = [[0.47, 0.4, 0.045], [0.64, 0.25, 0.03], [0.2, 0.22, 0.06], [0.55, 0.85, 0.04]]

function distToSeg(px: number, py: number, [ax, ay]: P, [bx, by]: P) {
  const dx = bx - ax, dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
const nearLine = (x: number, y: number, pts: P[], aspect: number) =>
  Math.min(...pts.slice(1).map((b, i) => distToSeg(x, y * aspect, [pts[i][0], pts[i][1] * aspect], [b[0], b[1] * aspect])))
// Direção da via no ponto mais próximo → caractere de linha
function roadChar(x: number, y: number, pts: P[], aspect: number) {
  let best = 0, bd = Infinity
  pts.slice(1).forEach((b, i) => {
    const d = distToSeg(x, y * aspect, [pts[i][0], pts[i][1] * aspect], [b[0], b[1] * aspect])
    if (d < bd) { bd = d; best = i }
  })
  const [a, b] = [pts[best], pts[best + 1]]
  const ang = Math.atan2((b[1] - a[1]) * aspect, b[0] - a[0])
  const deg = ((ang * 180) / Math.PI + 180) % 180
  if (deg < 22 || deg > 158) return '━'
  if (deg > 68 && deg < 112) return '┃'
  return deg < 90 ? '\\' : '/'
}
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

type Cell = { c: string; k: string }
const cls: Record<string, string> = {
  sea: 'text-water', water: 'text-water', park: 'text-olive-600', road: 'text-ink-1 font-semibold',
  bridge: 'text-earth-700 font-semibold', block: 'text-[#d6d1c4]', lane: 'text-ink-3/50',
}

export function AsciiMap({ rows = 26, size = 11, pins = [], className, label = 'Mapa ilustrativo do centro do Recife' }: {
  rows?: number; size?: number; pins?: Pin[]; className?: string; label?: string
}) {
  // Colunas se ajustam à largura disponível (caractere mono ≈ 0,6 do corpo)
  const ref = useRef<HTMLPreElement>(null)
  const [cols, setCols] = useState(60)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setCols(Math.max(20, Math.floor(el.clientWidth / (size * 0.6)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [size])

  const grid = useMemo(() => {
    const aspect = (rows * 2) / cols // célula mono ≈ 1:2
    const g: Cell[][] = []
    for (let r = 0; r < rows; r++) {
      const line: Cell[] = []
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) / cols, y = (r + 0.5) / rows
        const sea = x > 0.9 + 0.025 * Math.sin(y * 9)
        const water = rivers.some((rv) => nearLine(x, y, rv.pts, aspect) < rv.w)
        const roadIdx = roads.findIndex((rd) => nearLine(x, y, rd, aspect) < 0.6 / cols)
        const park = parks.some(([px, py, pr]) => Math.hypot(x - px, (y - py) * aspect) < pr)
        let cell: Cell
        if (sea) cell = { c: (r + c) % 3 ? '≈' : '~', k: 'sea' }
        else if (roadIdx >= 0 && water) cell = { c: '═', k: 'bridge' }
        else if (water) cell = { c: hash(c, r) > 0.7 ? '≈' : '~', k: 'water' }
        else if (roadIdx >= 0) cell = { c: roadChar(x, y, roads[roadIdx], aspect), k: 'road' }
        else if (park) cell = { c: hash(c, r) > 0.55 ? '♣' : '"', k: 'park' }
        else if (c % 6 === 0 || r % 3 === 0) cell = { c: c % 6 === 0 && r % 3 === 0 ? '+' : ' ', k: 'lane' }
        else cell = { c: hash(Math.floor(c / 6), Math.floor(r / 3)) > 0.82 ? ' ' : hash(c, r) > 0.35 ? '#' : '=', k: 'block' }
        line.push(cell)
      }
      g.push(line)
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
    <pre ref={ref} role="img" aria-label={label} style={{ fontSize: size }} className={cn('w-full overflow-hidden font-mono leading-[1.2] select-none', className)}>
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
