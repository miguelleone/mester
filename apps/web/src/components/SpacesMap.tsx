import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import type { Space } from '../api'

const RECIFE: [number, number] = [-8.0631, -34.8711]

const statusColor: Record<Space['status'], string> = {
  reportado: '#b5452b',
  com_proposta: '#c08a2e',
  em_obra: '#3f6e8c',
  adotado: '#4f5d2f',
}

const statusLabel: Record<Space['status'], string> = {
  reportado: 'Reportado',
  com_proposta: 'Com proposta',
  em_obra: 'Em obra',
  adotado: 'Adotado',
}

export function SpacesMap({ spaces }: { spaces: Space[] }) {
  return (
    <MapContainer center={RECIFE} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {spaces.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={10}
          pathOptions={{ color: statusColor[s.status], fillOpacity: 0.7 }}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {statusLabel[s.status]}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
