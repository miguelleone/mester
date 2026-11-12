import { useEffect, useState } from 'react'
import { fetchSpaces, type Space, type SpaceDetail } from './api'
import { SpacesMap } from './components/SpacesMap'
import { AuthPanel } from './components/AuthPanel'
import { ReportForm } from './components/ReportForm'
import { SpaceDetailPanel } from './components/SpaceDetailPanel'
import { useAuth } from './auth'

type Point = { lat: number; lng: number }

// Rota simples por hash: #/espacos/<id> abre o detalhe do espaço (link compartilhável)
const readSelected = () => location.hash.match(/^#\/espacos\/([\w-]+)$/)?.[1] ?? null

export default function App() {
  const { user } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(readSelected)
  const [reporting, setReporting] = useState(false)
  const [draft, setDraft] = useState<Point | null>(null)

  useEffect(() => {
    fetchSpaces().then(setSpaces).catch((e: Error) => setError(e.message))
    const onHash = () => setSelectedId(readSelected())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // Sair da conta no meio de um reporte cancela o reporte
  useEffect(() => { if (!user) stopReporting() }, [user])

  function select(id: string | null) {
    location.hash = id ? `/espacos/${id}` : ''
    setSelectedId(id)
  }

  function startReporting() {
    select(null)
    setReporting(true)
  }

  function stopReporting() {
    setReporting(false)
    setDraft(null)
  }

  // Mantém o mapa em sincronia com o que voltou da API (novo espaço ou status alterado)
  function upsert(s: SpaceDetail) {
    const { id, name, type, status, lat, lng } = s
    setSpaces((prev) => [...prev.filter((p) => p.id !== id), { id, name, type, status, lat, lng }])
  }

  const panelOpen = reporting || !!selectedId

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-ink/20 px-4 py-3">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">Mester</h1>
          <p className="text-sm opacity-70">Espaços da cidade à espera de cuidado</p>
        </div>
        <div className="flex items-center gap-3">
          {user && !reporting && (
            <button onClick={startReporting} className="rounded border border-moss px-3 py-1.5 text-sm text-moss">
              Reportar espaço
            </button>
          )}
          <AuthPanel />
        </div>
      </header>
      {error && <p className="px-4 py-2 text-sm text-red-700">{error}</p>}
      <main className="relative flex flex-1 flex-col md:flex-row">
        <div className={`min-h-0 flex-1 ${reporting ? 'picking' : ''}`}>
          <SpacesMap
            spaces={spaces}
            selectedId={selectedId}
            picking={reporting}
            draft={draft}
            onPick={setDraft}
            onSelect={select}
          />
        </div>
        {panelOpen && (
          <aside className="max-h-[55%] overflow-y-auto border-t border-ink/20 bg-parchment p-4 md:max-h-none md:w-96 md:border-t-0 md:border-l">
            {reporting ? (
              <ReportForm
                draft={draft}
                onCancel={stopReporting}
                onCreated={(s) => { upsert(s); stopReporting(); select(s.id) }}
              />
            ) : (
              <SpaceDetailPanel id={selectedId!} onChange={upsert} onClose={() => select(null)} />
            )}
          </aside>
        )}
      </main>
    </div>
  )
}
