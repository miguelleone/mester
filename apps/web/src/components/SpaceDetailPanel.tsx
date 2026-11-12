import { useEffect, useState, type FormEvent } from 'react'
import {
  addReport, fetchSpace, updateStatus, spaceTypeLabel, statusColor, statusLabel,
  type SpaceDetail, type SpaceStatus,
} from '../api'
import { useAuth } from '../auth'
import { field } from './ui'

const steps = Object.keys(statusLabel) as SpaceStatus[]
const date = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

type Props = {
  id: string
  onChange: (s: SpaceDetail) => void
  onClose: () => void
}

export function SpaceDetailPanel({ id, onChange, onClose }: Props) {
  const { user, token } = useAuth()
  const [space, setSpace] = useState<SpaceDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setSpace(null)
    setError(null)
    fetchSpace(id).then(setSpace).catch((e: Error) => setError(e.message))
  }, [id])

  async function run(action: () => Promise<SpaceDetail>) {
    setBusy(true)
    setError(null)
    try {
      const s = await action()
      setSpace(s)
      onChange(s)
      return true
    } catch (err) {
      setError((err as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function onReinforce(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const description = String(new FormData(form).get('description'))
    if (await run(() => addReport(token!, id, description))) form.reset()
  }

  const canManage = user?.role === 'gestor' || user?.role === 'admin'
  const alreadyReported = !!user && !!space?.reports.some((r) => r.author.id === user.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60">
            {space ? `${spaceTypeLabel[space.type]} · ${space.isPublic ? 'público' : 'privado'}` : 'Carregando...'}
          </p>
          <h2 className="font-serif text-xl">{space?.name}</h2>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="text-xl leading-none opacity-60 hover:opacity-100">×</button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {space && (
        <>
          <ol className="flex gap-1">
            {steps.map((st, i) => {
              const reached = i <= steps.indexOf(space.status)
              return (
                <li key={st} className="flex-1">
                  <div className="h-1.5 rounded" style={{ background: reached ? statusColor[space.status] : '#2b211822' }} />
                  <span className={`mt-1 block text-[11px] ${st === space.status ? 'font-semibold' : 'opacity-60'}`}>
                    {statusLabel[st]}
                  </span>
                </li>
              )
            })}
          </ol>

          {canManage && (
            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
              Mudar status
              <select
                value={space.status}
                disabled={busy}
                onChange={(e) => run(() => updateStatus(token!, id, e.target.value as SpaceStatus))}
                className={`${field} w-auto`}
              >
                {steps.map((st) => <option key={st} value={st}>{statusLabel[st]}</option>)}
              </select>
            </label>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold">
              {space.reports.length} {space.reports.length === 1 ? 'reporte' : 'reportes'}
            </h3>
            <ul className="flex flex-col gap-3">
              {space.reports.map((r) => (
                <li key={r.id} className="border-l-2 border-ink/20 pl-3">
                  <p className="whitespace-pre-line text-sm">{r.description}</p>
                  <p className="mt-1 text-xs opacity-60">{r.author.name} · {date(r.createdAt)}</p>
                </li>
              ))}
            </ul>
          </section>

          {user && !alreadyReported && (
            <form onSubmit={onReinforce} className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="reinforce">Também passa por aqui?</label>
              <textarea
                id="reinforce" name="description" required minLength={10} maxLength={2000} rows={3}
                placeholder="Conte o que você viu para reforçar o reporte"
                className={field}
              />
              <button disabled={busy} className="self-start rounded bg-moss px-3 py-1.5 text-sm text-parchment disabled:opacity-50">
                Reforçar reporte
              </button>
            </form>
          )}
          {!user && <p className="text-sm opacity-70">Entre para reforçar este reporte.</p>}
        </>
      )}
    </div>
  )
}
