import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { statusColor, statusLabel, type Space } from '../api'

const RECIFE: [number, number] = [-8.0631, -34.8711]

// Pino do ponto que está sendo reportado (divIcon evita depender das imagens padrão do Leaflet)
const draftIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2b2118;border:3px solid #f4ecd8;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

function ClickToPick({ onPick }: { onPick: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// O painel lateral muda o tamanho do mapa; o Leaflet só percebe mudanças da janela
function FitContainer() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
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
  return (
    <MapContainer center={RECIFE} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitContainer />
      {picking && <ClickToPick onPick={onPick} />}
      {spaces.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={s.id === selectedId ? 14 : 10}
          pathOptions={{ color: statusColor[s.status], fillOpacity: 0.7, weight: s.id === selectedId ? 4 : 3 }}
          eventHandlers={{ click: () => { if (!picking) onSelect(s.id) } }}
        >
          <Tooltip>{s.name} · {statusLabel[s.status]}</Tooltip>
        </CircleMarker>
      ))}
      {draft && <Marker position={[draft.lat, draft.lng]} icon={draftIcon} />}
    </MapContainer>
  )
}
