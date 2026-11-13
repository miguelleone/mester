import { useEffect, useState, type FormEvent } from 'react'
import {
  addReport, fetchSpace, photoUrl, updateStatus, spaceTypeLabel, statusLabel,
  type SpaceDetail, type SpaceStatus,
} from '../api'
import { useAuth } from '../auth'
import { Button, Field, Pixel, Select, Spinner, StatusPath, Textarea, spaceArt, useToast } from './ui'
import { PhotoPicker } from './PhotoPicker'

const steps = Object.keys(statusLabel) as SpaceStatus[]
const date = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

type Props = {
  id: string
  onChange: (s: SpaceDetail) => void
  onLogin: () => void
}

const label = 'font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase'

// Detalhe do espaço, aberto dentro da faixa da lista: etapa, reportes com fotos e reforço
export function SpaceDetailPanel({ id, onChange, onLogin }: Props) {
  const { user, token } = useAuth()
  const toast = useToast()
  const [space, setSpace] = useState<SpaceDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setSpace(null)
    setError(null)
    fetchSpace(id).then(setSpace).catch((e: Error) => setError(e.message))
  }, [id])

  async function run(action: () => Promise<SpaceDetail>, done: string) {
    setBusy(true)
    setError(null)
    try {
      const s = await action()
      setSpace(s)
      onChange(s)
      toast(done)
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
    if (await run(() => addReport(token!, id, description, photos), 'reforço enviado')) {
      form.reset()
      setPhotos([])
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href)
      toast('link copiado', 'info')
    } catch {
      toast('não deu para copiar o link', 'error')
    }
  }

  const canManage = user?.role === 'gestor' || user?.role === 'admin'
  const alreadyReported = !!user && !!space?.reports.some((r) => r.author.id === user.id)

  if (!space) {
    return error
      ? <p role="alert" className="text-[15px] text-alert"><span className="font-mono text-[12px] font-bold">! </span>{error}</p>
      : <p className="font-mono text-[12px] text-ink-2"><Spinner /> carregando espaço</p>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <p className={label}>{spaceTypeLabel[space.type]} · {space.isPublic ? 'público' : 'privado'}</p>
          <Pixel art={spaceArt[space.type]} title={spaceTypeLabel[space.type]} className="h-10 w-auto shrink-0" />
        </div>
        <StatusPath status={space.status} />
      </div>

      {canManage && (
        <Field label="mudar status" inline>
          <Select
            value={space.status}
            disabled={busy}
            onChange={(e) => {
              const next = e.target.value as SpaceStatus
              run(() => updateStatus(token!, id, next), `status: ${statusLabel[next].toLowerCase()}`)
            }}
          >
            {steps.map((st) => <option key={st} value={st}>{statusLabel[st]}</option>)}
          </Select>
        </Field>
      )}

      {error && <p role="alert" className="text-[15px] text-alert"><span className="font-mono text-[12px] font-bold">! </span>{error}</p>}

      <section className="flex flex-col gap-3">
        <h3 className={label}>
          {space.reports.length} {space.reports.length === 1 ? 'reporte' : 'reportes'}
        </h3>
        <ol className="flex flex-col gap-4">
          {space.reports.map((r, i) => (
            <li key={r.id} className="flex flex-col gap-1.5">
              <p className="font-mono text-[11px] text-ink-3">
                <span aria-hidden>{i === space.reports.length - 1 ? '└─ ' : '├─ '}</span>
                {r.author.name} · {date(r.createdAt)}
              </p>
              <p className="whitespace-pre-line text-[16px] leading-snug">{r.description}</p>
              {r.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {r.photos.map((p, j) => (
                    <a key={p} href={photoUrl(p)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md">
                      <img src={photoUrl(p)} alt={`Foto ${j + 1} de ${r.author.name}`} loading="lazy" className="aspect-square w-full object-cover transition-transform hover:scale-105" />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {user && !alreadyReported && (
        <form onSubmit={onReinforce} className="flex flex-col gap-3">
          <Field label="também passa por aqui?">
            <Textarea
              name="description" required minLength={10} maxLength={2000} rows={3}
              placeholder="Conte o que você viu para reforçar o reporte"
            />
          </Field>
          <PhotoPicker value={photos} onChange={setPhotos} onBusy={setUploading} />
          <Button className="self-start" glyph="+" loading={busy} disabled={uploading}>reforçar reporte</Button>
        </form>
      )}
      {!user && (
        <p className="text-[15px] text-ink-2">
          <Button variant="link" onClick={onLogin}>entre</Button> para reforçar este reporte.
        </p>
      )}

      <div className="flex flex-wrap gap-x-3">
        <Button variant="link" onClick={copyLink}>copiar link</Button>
      </div>
    </div>
  )
}
