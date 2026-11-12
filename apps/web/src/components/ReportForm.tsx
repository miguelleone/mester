import { useState, type FormEvent } from 'react'
import { createSpace, spaceTypeLabel, type SpaceDetail, type SpaceType } from '../api'
import { useAuth } from '../auth'
import { field } from './ui'
import { PhotoPicker } from './PhotoPicker'

type Props = {
  draft: { lat: number; lng: number } | null
  onCreated: (s: SpaceDetail) => void
  onCancel: () => void
}

export function ReportForm({ draft, onCreated, onCancel }: Props) {
  const { token } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!draft || !token) return
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      const space = await createSpace(token, {
        name: String(f.get('name')),
        type: f.get('type') as SpaceType,
        isPublic: f.get('isPublic') === 'on',
        description: String(f.get('description')),
        photos,
        ...draft,
      })
      onCreated(space)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h2 className="font-serif text-xl">Reportar um espaço</h2>
      <p className={`rounded px-3 py-2 text-sm ${draft ? 'bg-moss/10' : 'bg-ink/5'}`}>
        {draft
          ? 'Ponto marcado. Clique em outro lugar do mapa para ajustar.'
          : 'Clique no mapa para marcar onde fica o espaço.'}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input name="name" required minLength={3} maxLength={120} placeholder="Ex.: Praça da Rua do Sol" className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Tipo
        <select name="type" defaultValue="praca" className={field}>
          {Object.entries(spaceTypeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        O que está acontecendo?
        <textarea
          name="description" required minLength={10} maxLength={2000} rows={4}
          placeholder="Descreva o estado do espaço: lixo, mato alto, pichação, bancos quebrados..."
          className={field}
        />
      </label>
      <div className="flex flex-col gap-1 text-sm">
        Fotos
        <PhotoPicker value={photos} onChange={setPhotos} onBusy={setUploading} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked />
        É um espaço público
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy || uploading || !draft} className="rounded bg-moss px-3 py-1.5 text-sm text-parchment disabled:opacity-50">
          {busy ? 'Enviando...' : 'Enviar reporte'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm underline">Cancelar</button>
      </div>
    </form>
  )
}
