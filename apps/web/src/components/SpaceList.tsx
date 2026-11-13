import { useEffect } from 'react'
import { statusLabel, type Space, type SpaceDetail, type SpaceStatus } from '../api'
import { Band, Button, Pixel, Spinner, sprout, statusBg, cn } from './ui'
import { SpaceDetailPanel } from './SpaceDetailPanel'

const statuses = Object.keys(statusLabel) as SpaceStatus[]
const short: Record<SpaceStatus, string> = { reportado: 'reportado', com_proposta: 'proposta', em_obra: 'obra', adotado: 'adotado' }

type Props = {
  spaces: Space[]
  loading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (s: SpaceDetail) => void
  onLogin: () => void
  onReport: () => void
}

// Lista de espaços como índice: faixas numeradas na cor da etapa, com os mesmos números dos pinos
export function SpaceList({ spaces, loading, error, selectedId, onSelect, onChange, onLogin, onReport }: Props) {
  // Pino clicado no mapa: rola até a faixa aberta
  useEffect(() => {
    if (selectedId) document.getElementById(`espaco-${selectedId}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [selectedId, spaces.length])

  const counts = statuses.map((st) => [st, spaces.filter((s) => s.status === st).length] as const)

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-paper/95 px-3 py-2 backdrop-blur-sm md:px-1">
        <h2 className="font-mono! text-[11px] font-semibold! tracking-[0.08em] text-ink-2 uppercase">
          {loading ? 'carregando espaços' : `${spaces.length} ${spaces.length === 1 ? 'espaço' : 'espaços'} no mapa`}
        </h2>
        <ul aria-label="Legenda das etapas" className="flex flex-wrap gap-x-2.5 font-mono text-[10.5px] text-ink-2">
          {counts.map(([st, n]) => (
            <li key={st} className="flex items-center gap-1">
              <span aria-hidden className={cn('size-2.5 rounded-[2px]', statusBg[st])} />
              {short[st]} <span className="text-ink-3">{n}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p role="alert" className="mx-3 my-2 text-[15px] text-alert md:mx-1">
          <span className="font-mono text-[12px] font-bold">! </span>Não foi possível carregar os espaços: {error}
        </p>
      )}

      {loading && <p className="px-3 py-4 font-mono text-[12px] text-ink-2 md:px-1"><Spinner /> buscando no mapa</p>}

      {!loading && !error && spaces.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Pixel art={sprout} className="h-12 w-auto" />
          <p className="font-display text-[24px] leading-tight">Nenhum espaço reportado ainda</p>
          <p className="max-w-[34ch] text-ink-2">Viu uma praça largada ou um canteiro sem cuidado? Marque no mapa e conte o que está acontecendo.</p>
          <Button glyph="+" onClick={onReport}>reportar o primeiro</Button>
        </div>
      )}

      {spaces.length > 0 && (
        <div className="flex flex-col md:overflow-hidden md:rounded-lg">
          {spaces.map((s, i) => {
            const open = s.id === selectedId
            return (
              <Band
                key={s.id}
                id={`espaco-${s.id}`}
                n={i + 1}
                title={s.name}
                status={s.status}
                open={open}
                onToggle={() => onSelect(open ? null : s.id)}
                bodyClassName="px-3 pt-4 pb-6 sm:pl-10"
              >
                <SpaceDetailPanel id={s.id} onChange={onChange} onLogin={onLogin} />
              </Band>
            )
          })}
        </div>
      )}
    </div>
  )
}
