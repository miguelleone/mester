import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { statusLabel, type Space } from '../api'
import { statusHex, cn } from './ui'
import { AsciiTileLayer } from './map/asciiTiles'

const RECIFE: [number, number] = [-8.0631, -34.8711]
const TILES = import.meta.env.VITE_MAP_TILES || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
// Nomes de ruas e bairros por cima do ASCII (tiles transparentes, só texto)
const LABELS = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
const CARTO = '&copy; <a href="https://carto.com/attributions">CARTO</a>'

type Mode = 'ascii' | 'ruas'
const MODE_KEY = 'mester:mapa'
const readMode = (): Mode => {
  try { return localStorage.getItem(MODE_KEY) === 'ruas' ? 'ruas' : 'ascii' } catch { return 'ascii' }
}

// Pinos [01] na cor da etapa; o selecionado inverte (tinta com texto branco)
const icons = new Map<string, L.DivIcon>()
function pinIcon(label: string, color: string | null, selected = false) {
  const key = `${label}|${color}|${selected}`
  let icon = icons.get(key)
  if (!icon) {
    icon = L.divIcon({
      className: 'map-pin-anchor',
      html: `<span class="map-pin${selected ? ' is-selected' : ''}${color ? '' : ' is-draft'}"${color ? ` style="--pin:${color}"` : ''}>[${label}]</span>`,
      iconSize: [8 * (label.length + 2), 18],
      iconAnchor: [4 * (label.length + 2), 9],
    })
    icons.set(key, icon)
  }
  return icon
}

function AsciiTiles() {
  const map = useMap()
  useEffect(() => {
    const layer = new AsciiTileLayer({ url: TILES, attribution: OSM, maxZoom: 19, updateWhenZooming: false, keepBuffer: 3 }).addTo(map)
    return () => { layer.remove() }
  }, [map])
  return null
}

function ClickToPick({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// O painel muda o tamanho do mapa; o Leaflet só percebe mudanças da janela
function FitContainer() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
  return null
}

// Espaço escolhido na lista: traz o pino para a área visível
function FollowSelected({ space }: { space: Space | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!space) return
    const p = L.latLng(space.lat, space.lng)
    if (!map.getBounds().pad(-0.15).contains(p)) map.panTo(p)
  }, [map, space])
  return null
}

type Props = {
  spaces: Space[]
  selectedId: string | null
  picking: boolean
  draft: { lat: number; lng: number } | null
  onPick: (p: { lat: number; lng: number }) => void
  onSelect: (id: string) => void
}

export function SpacesMap({ spaces, selectedId, picking, draft, onPick, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>(readMode)
  function changeMode(m: Mode) {
    setMode(m)
    try { localStorage.setItem(MODE_KEY, m) } catch { /* sem armazenamento: só não lembra a escolha */ }
  }

  return (
    // A classe do modo fica no wrapper: o MapContainer não atualiza className depois de montado
    <div className={cn('relative h-full w-full', mode === 'ruas' && 'map-plain')}>
      <MapContainer center={RECIFE} zoom={14} minZoom={11} maxZoom={19} className="h-full w-full">
        {mode === 'ascii' ? (
          <>
            <AsciiTiles />
            <TileLayer url={LABELS} attribution={CARTO} subdomains="abcd" maxZoom={19} className="map-labels" />
          </>
        ) : (
          <TileLayer url={TILES} attribution={OSM} maxZoom={19} />
        )}
        <FitContainer />
        <FollowSelected space={spaces.find((s) => s.id === selectedId)} />
        {picking && <ClickToPick onPick={onPick} />}
        {spaces.map((s, i) => {
          const selected = s.id === selectedId
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={pinIcon(String(i + 1).padStart(2, '0'), statusHex[s.status], selected)}
              zIndexOffset={selected ? 1000 : 0}
              eventHandlers={{ click: () => { if (!picking) onSelect(s.id) } }}
            >
              <Tooltip direction="top" offset={[0, -8]}>{s.name} · {statusLabel[s.status]}</Tooltip>
            </Marker>
          )
        })}
        {draft && <Marker position={[draft.lat, draft.lng]} icon={pinIcon('+', null)} zIndexOffset={2000} interactive={false} />}
      </MapContainer>

      {/* Troca entre o mapa em caracteres e o mapa comum (para achar a rua com calma) */}
      <div role="group" aria-label="Estilo do mapa" className="absolute top-2.5 right-2.5 z-[1000] flex rounded-full bg-paper p-0.5 font-mono text-[11px] shadow-soft">
        {(['ascii', 'ruas'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => changeMode(m)}
            className={cn('h-6 rounded-full px-2.5 transition-colors', mode === m ? 'bg-ink-1 text-paper' : 'text-ink-2 hover:bg-hl')}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
