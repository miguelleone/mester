import { useState, type FormEvent } from 'react'
import { createSpace, spaceTypeLabel, type SpaceDetail, type SpaceType } from '../api'
import { useAuth } from '../auth'
import { Button, Checkbox, Cursor, Field, Input, Select, Textarea, Window } from './ui'
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
    <Window
      title="novo reporte"
      onClose={onCancel}
      className="max-h-full"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>cancelar</Button>
          <Button type="submit" form="report-form" glyph="→" loading={busy} disabled={uploading || !draft}>
            {busy ? 'enviando' : 'enviar reporte'}
          </Button>
        </div>
      }
    >
      <form id="report-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-[26px] leading-tight">Reportar um espaço</h2>
          {/* Passo do mapa: muda quando o ponto é marcado */}
          <p aria-live="polite" className={`mt-2 rounded-md px-3 py-2 font-mono text-[12px] ${draft ? 'bg-olive-100 text-olive-800' : 'bg-paper-2 text-ink-2'}`}>
            {draft ? (
              <>
                <span aria-hidden>■ </span>ponto marcado em {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
                <span className="block text-ink-2">toque de novo no mapa para ajustar</span>
              </>
            ) : (
              <><span aria-hidden>&gt; </span>toque no mapa para marcar onde fica o espaço <Cursor /></>
            )}
          </p>
        </div>
        <Field label="nome">
          <Input name="name" required minLength={3} maxLength={120} placeholder="Ex.: Praça da Rua do Sol" />
        </Field>
        <Field label="tipo">
          <Select name="type" defaultValue="praca">
            {Object.entries(spaceTypeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </Field>
        <Field label="o que está acontecendo?">
          <Textarea
            name="description" required minLength={10} maxLength={2000}
            placeholder="Lixo, mato alto, pichação, bancos quebrados..."
          />
        </Field>
        <Field label="fotos" optional>
          <PhotoPicker value={photos} onChange={setPhotos} onBusy={setUploading} />
        </Field>
        <Checkbox name="isPublic" defaultChecked label="É um espaço público" description="Praça, calçada, canteiro, terreno da prefeitura..." />
        {error && <p role="alert" className="text-[15px] text-alert"><span className="font-mono text-[12px] font-bold">! </span>{error}</p>}
      </form>
    </Window>
  )
}
