import { useEffect, useState } from 'react'
import { fetchSpaces, type Space, type SpaceDetail } from './api'
import { SpacesMap } from './components/SpacesMap'
import { AuthPanel } from './components/AuthPanel'
import { ReportForm } from './components/ReportForm'
import { SpaceList } from './components/SpaceList'
import { Button, Cursor, Logo, cn, useToast } from './components/ui'
import { useAuth } from './auth'

type Point = { lat: number; lng: number }

// Rota simples por hash: #/espacos/<id> abre o espaço na lista (link compartilhável)
const readSelected = () => location.hash.match(/^#\/espacos\/([\w-]+)$/)?.[1] ?? null

export default function App() {
  const { user } = useAuth()
  const toast = useToast()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(readSelected)
  const [reporting, setReporting] = useState(false)
  const [draft, setDraft] = useState<Point | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    fetchSpaces()
      .then(setSpaces)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    const onHash = () => setSelectedId(readSelected())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // Sair da conta no meio de um reporte cancela o reporte
  useEffect(() => { if (!user) stopReporting() }, [user])

  function select(id: string | null) {
    if (id) location.hash = `/espacos/${id}`
    else history.replaceState(null, '', location.pathname + location.search)
    setSelectedId(id)
  }

  function startReporting() {
    if (!user) return setAuthOpen(true)
    select(null)
    setReporting(true)
  }

  function stopReporting() {
    setReporting(false)
    setDraft(null)
  }

  // Mantém mapa e lista em sincronia com o que voltou da API (novo espaço ou status alterado), sem mudar a numeração
  function upsert(s: SpaceDetail) {
    const { id, name, type, status, lat, lng } = s
    const next = { id, name, type, status, lat, lng }
    setSpaces((prev) => (prev.some((p) => p.id === id) ? prev.map((p) => (p.id === id ? next : p)) : [...prev, next]))
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="relative z-20 flex h-12 shrink-0 items-center gap-3 px-3 sm:px-4">
        <a href="#" onClick={(e) => { e.preventDefault(); stopReporting(); select(null) }} aria-label="Mester, voltar ao início" className="rounded-sm">
          <Logo className="text-[25px]" />
        </a>
        <p className="hidden truncate text-[15px] text-ink-3 italic lg:block">espaços da cidade à espera de cuidado</p>
        <div className="ml-auto flex items-center gap-1.5">
          {!reporting && <Button size="sm" glyph="+" onClick={startReporting}>reportar</Button>}
          <AuthPanel open={authOpen} onOpenChange={setAuthOpen} />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row md:gap-3 md:px-3 md:pb-3">
        <div className={cn('relative isolate mx-2 h-[42dvh] shrink-0 overflow-hidden rounded-lg bg-paper-2 md:mx-0 md:h-auto md:flex-1', reporting && 'picking')}>
          <SpacesMap
            spaces={spaces}
            selectedId={selectedId}
            picking={reporting}
            draft={draft}
            onPick={setDraft}
            onSelect={select}
          />
          {reporting && (
            <p className="pointer-events-none absolute inset-x-0 bottom-3 z-[1000] flex justify-center px-3 md:top-2.5 md:bottom-auto">
              <span className="rounded-full bg-ink-1 px-3.5 py-1 font-mono text-[12px] text-paper shadow-float">
                <span aria-hidden className="text-paper/50">&gt; </span>
                {draft ? 'ponto marcado · toque para ajustar' : 'toque no mapa para marcar o ponto'} <Cursor className="text-olive-400" />
              </span>
            </p>
          )}
        </div>

        <aside className="min-h-0 flex-1 overflow-y-auto md:w-[400px] md:flex-none">
          {reporting ? (
            <div className="h-full px-2 pb-2 md:p-0">
              <ReportForm
                draft={draft}
                onCancel={stopReporting}
                onCreated={(s) => { upsert(s); stopReporting(); select(s.id); toast('reporte enviado, obrigado') }}
              />
            </div>
          ) : (
            <SpaceList
              spaces={spaces}
              loading={loading}
              error={error}
              selectedId={selectedId}
              onSelect={select}
              onChange={upsert}
              onLogin={() => setAuthOpen(true)}
              onReport={startReporting}
            />
          )}
        </aside>
      </main>
    </div>
  )
}
