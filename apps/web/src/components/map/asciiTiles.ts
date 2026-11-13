import L from 'leaflet'

/*
 * Camada do mapa real em ASCII. Cada tile do OpenStreetMap é baixado, lido pixel a pixel e
 * redesenhado como caracteres: a cor diz o que é (água, verde, prédio, rua, avenida...) e a
 * forma das ruas dentro da célula escolhe o traço (─ │ ╱ ╲ ┼). Mesma linguagem do AsciiMap.
 * Se o servidor de tiles não liberar CORS, o tile aparece como imagem em tons de cinza.
 */

const TILE = 256
const COLS = 44
const ROWS = 24
const CW = TILE / COLS // ≈ 5,8 px
const CH = TILE / ROWS // ≈ 10,7 px

// Classes de pixel
const LAND = 0, ZONE = 1, WATER = 2, GREEN = 3, BUILDING = 4, ROAD = 5, MAJOR = 6, CASING = 7, BEACH = 8, DARK = 9
const NCLS = 10

// Paleta do estilo padrão do OSM (openstreetmap-carto) → classe
const reference: [number, number][] = [
  [0xf2efe9, LAND],
  [0xe0dfdf, ZONE], [0xf2dad9, ZONE], [0xffd6d1, ZONE], [0xebdbe8, ZONE], [0xffffe5, ZONE], [0xeeeeee, ZONE], [0xdddde8, ZONE],
  [0xaad3df, WATER],
  [0xc8facc, GREEN], [0xcdebb0, GREEN], [0xadd19e, GREEN], [0xaae0cb, GREEN], [0xdffce2, GREEN], [0xc8d7ab, GREEN], [0xaedfa3, GREEN], [0xdef6c0, GREEN],
  [0xd9d0c9, BUILDING], [0xc4b6ab, BUILDING],
  [0xffffff, ROAD],
  [0xf7fabf, MAJOR], [0xfcd6a4, MAJOR], [0xf9b29c, MAJOR], [0xe892a2, MAJOR], [0xa06b00, MAJOR], [0xc84e2f, MAJOR], [0xdc2a67, MAJOR], [0x707d05, MAJOR],
  [0xbbbbbb, CASING], [0x999999, CASING], [0xfa8072, CASING],
  [0xfff1ba, BEACH], [0xf5e9c6, BEACH],
]

const cache = new Map<number, number>()
function classify(r: number, g: number, b: number): number {
  const key = (r << 16) | (g << 8) | b
  let k = cache.get(key)
  if (k !== undefined) return k
  if (Math.max(r, g, b) < 100) k = DARK
  else {
    let best = Infinity
    for (const [hex, cls] of reference) {
      const dr = r - (hex >> 16), dg = g - ((hex >> 8) & 255), db = b - (hex & 255)
      const d = dr * dr + dg * dg + db * db
      if (d < best) { best = d; k = cls }
    }
    // Cor fora da paleta (estilo diferente, borda suavizada): decide pelo matiz
    if (best > 40 * 40) k = b > r + 20 && b >= g ? WATER : g > r + 10 && g > b ? GREEN : r + g + b > 690 ? LAND : ZONE
  }
  if (cache.size > 50_000) cache.clear()
  cache.set(key, k!)
  return k!
}

// Ruído determinístico por posição: o mesmo lugar sempre ganha o mesmo caractere
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

const ink = {
  water: '#7b8994', park: '#6b7440', tree: '#a5ad7c', avenue: '#1d1a16', street: '#8b857b', bridge: '#4a3a2c',
  b1: '#c9c2b3', b2: '#dcd6ca', b3: '#b8aa97', lane: '#d6d0c3', land: '#e2ded5', beach: '#8a7358',
}
const dense = '##%@&▓#=%#'
const light = '=+:;=-'

type Glyph = { c: string; color: string; bold?: boolean }

// Contagem de pixels de cada classe por célula
function countCells(px: Uint8Array) {
  const counts = new Uint16Array(ROWS * COLS * NCLS)
  for (let row = 0; row < ROWS; row++) {
    const y0 = Math.floor(row * CH), y1 = Math.floor((row + 1) * CH)
    for (let col = 0; col < COLS; col++) {
      const x0 = Math.floor(col * CW), x1 = Math.floor((col + 1) * CW)
      const base = (row * COLS + col) * NCLS
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) counts[base + px[y * TILE + x]]++
    }
  }
  return counts
}

// Traço da via a partir da orientação dos pixels de rua ao redor da célula
function stroke(px: Uint8Array, cx: number, cy: number, match: (k: number) => boolean, heavy: boolean): string {
  const x0 = Math.max(0, Math.floor(cx - CW)), x1 = Math.min(TILE, Math.ceil(cx + CW))
  const y0 = Math.max(0, Math.floor(cy - CH * 0.6)), y1 = Math.min(TILE, Math.ceil(cy + CH * 0.6))
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (!match(px[y * TILE + x])) continue
      n++; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y
    }
  }
  const area = (x1 - x0) * (y1 - y0)
  // Miolo de via larga (zoom alto): pavimento
  if (n > area * 0.8) return heavy ? ':' : '·'
  const mx = sx / n, my = sy / n
  const cxx = sxx / n - mx * mx, cyy = syy / n - my * my, cxy = sxy / n - mx * my
  const tr = cxx + cyy, det = cxx * cyy - cxy * cxy
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det))
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc
  if (l1 <= 0 || (l1 - l2) / (l1 + l2) < 0.3) return heavy ? '╋' : '┼'
  const deg = (Math.atan2(2 * cxy, cxx - cyy) * 90) / Math.PI // -90..90, y para baixo
  if (Math.abs(deg) < 24) return heavy ? '━' : '─'
  if (Math.abs(deg) > 66) return heavy ? '┃' : '│'
  return deg > 0 ? (heavy ? '\\' : '╲') : heavy ? '/' : '╱'
}

const VERTICAL = new Set(['│', '┃']), HORIZONTAL = new Set(['─', '━'])

// Afina a linha: uma via que cai entre duas células fica só na que tem mais pixels dela
function thinned(score: (col: number, row: number) => number, c: string, col: number, row: number) {
  const mine = score(col, row)
  const pair = VERTICAL.has(c) ? [[col - 1, row], [col + 1, row]] : HORIZONTAL.has(c) ? [[col, row - 1], [col, row + 1]] : null
  if (!pair) return false
  const [a, b] = pair
  const inside = ([x, y]: number[]) => x >= 0 && x < COLS && y >= 0 && y < ROWS
  // empate: fica a da esquerda / de cima
  return (inside(a) && score(a[0], a[1]) >= mine) || (inside(b) && score(b[0], b[1]) > mine)
}

function glyphAt(px: Uint8Array, counts: Uint16Array, col: number, row: number, gx: number, gy: number): Glyph | null {
  const x0 = Math.floor(col * CW), x1 = Math.floor((col + 1) * CW)
  const y0 = Math.floor(row * CH), y1 = Math.floor((row + 1) * CH)
  const at = (c: number, r: number) => (r * COLS + c) * NCLS
  const count = counts.subarray(at(col, row), at(col, row) + NCLS)
  const n = (x1 - x0) * (y1 - y0)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  const h = hash(gx, gy)
  const isRoad = (k: number) => k === ROAD || k === CASING
  const isMajor = (k: number) => k === MAJOR
  const majorScore = (c: number, r: number) => counts[at(c, r) + MAJOR]
  const streetScore = (c: number, r: number) => counts[at(c, r) + ROAD] + counts[at(c, r) + CASING] / 2

  if (count[WATER] >= n * 0.45) {
    if (count[ROAD] + count[MAJOR] >= n * 0.12) return { c: '═', color: ink.bridge, bold: true }
    return { c: h > 0.75 ? '≈' : '~', color: ink.water }
  }
  if (count[MAJOR] >= Math.max(3, n * 0.06)) {
    const c = stroke(px, cx, cy, isMajor, true)
    if (!thinned(majorScore, c, col, row)) return { c, color: ink.avenue, bold: true }
  }
  // Célula com texto do tile: o branco é o halo das letras, não rua
  const text = count[DARK] >= n * 0.08
  if (!text && count[MAJOR] < 3 && (count[ROAD] >= Math.max(4, n * 0.07) || count[CASING] >= n * 0.15)) {
    const c = stroke(px, cx, cy, isRoad, false)
    if (!thinned(streetScore, c, col, row)) return { c, color: ink.street }
  }

  if (count[GREEN] >= n * 0.35) return h > 0.6 ? { c: '♣', color: ink.tree } : { c: h > 0.3 ? '"' : ';', color: ink.park }
  if (count[BUILDING] >= n * 0.3) return { c: dense[Math.floor(h * dense.length)], color: h > 0.5 ? ink.b1 : ink.b3 }
  if (count[BEACH] >= n * 0.4) return { c: h > 0.5 ? '.' : ':', color: ink.beach }
  if (count[ZONE] >= count[LAND]) return { c: h > 0.45 ? light[Math.floor(h * 2 * light.length) % light.length] : '·', color: h > 0.7 ? ink.b2 : ink.lane }
  return h > 0.82 ? { c: '·', color: ink.land } : null
}

// A fonte precisa estar carregada antes de desenhar no canvas
let fontReady: Promise<unknown> | null = null
const FONT = '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace'
const loadFont = () => (fontReady ??= document.fonts?.load(`500 10px ${FONT}`).catch(() => null) ?? Promise.resolve())

function drawAscii(ctx: CanvasRenderingContext2D, img: HTMLImageElement, coords: L.Coords) {
  const off = document.createElement('canvas')
  off.width = off.height = TILE
  const octx = off.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(img, 0, 0, TILE, TILE)
  const data = octx.getImageData(0, 0, TILE, TILE).data // lança erro se o tile não liberou CORS
  const px = new Uint8Array(TILE * TILE)
  for (let i = 0; i < px.length; i++) px[i] = data[i * 4 + 3] < 128 ? LAND : classify(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])

  const counts = countCells(px)
  const size = CW / 0.6 // largura do caractere da JetBrains Mono = 0,6 em
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const g = glyphAt(px, counts, col, row, coords.x * COLS + col, coords.y * ROWS + row)
      if (!g) continue
      ctx.font = `${g.bold ? 700 : 500} ${size}px ${FONT}`
      ctx.fillStyle = g.color
      ctx.fillText(g.c, (col + 0.5) * CW, (row + 0.5) * CH + 0.5)
    }
  }
}

export type AsciiTileOptions = L.GridLayerOptions & { url: string }

export const AsciiTileLayer = L.GridLayer.extend({
  createTile(this: L.GridLayer & { options: AsciiTileOptions }, coords: L.Coords, done: L.DoneCallback) {
    const canvas = document.createElement('canvas')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = canvas.height = TILE * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const url = L.Util.template(this.options.url, { ...coords, s: 'abc'[(coords.x + coords.y) % 3] })

    // Sem CORS não dá para ler os pixels: mostra o tile original, apagado
    const fallback = () => {
      const plain = new Image()
      plain.onload = () => {
        ctx.filter = 'grayscale(1) contrast(0.8) brightness(1.06)'
        ctx.drawImage(plain, 0, 0, TILE, TILE)
        done(undefined, canvas)
      }
      plain.onerror = () => done(new Error(`tile ${url}`), canvas)
      plain.src = url
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      loadFont().then(() => {
        try {
          drawAscii(ctx, img, coords)
          done(undefined, canvas)
        } catch {
          fallback()
        }
      })
    }
    img.onerror = fallback
    img.src = url
    return canvas
  },
}) as unknown as new (options: AsciiTileOptions) => L.GridLayer
