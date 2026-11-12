import { useState, type ChangeEvent } from 'react'
import { photoUrl, uploadPhoto } from '../api'
import { useAuth } from '../auth'

const MAX = 5

type Props = { value: string[]; onChange: (photos: string[]) => void; onBusy?: (busy: boolean) => void }

// Envia cada foto assim que escolhida e guarda os caminhos para o reporte
export function PhotoPicker({ value, onChange, onBusy }: Props) {
  const { token } = useAuth()
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX - value.length)
    e.target.value = ''
    if (!files.length || !token) return
    setError(null)
    setUploading(files.length)
    onBusy?.(true)
    const urls: string[] = []
    for (const f of files) {
      try {
        urls.push(await uploadPhoto(token, f))
      } catch (err) {
        setError(`${f.name}: ${(err as Error).message}`)
      }
      setUploading((n) => n - 1)
    }
    onBusy?.(false)
    onChange([...value, ...urls])
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <img src={photoUrl(url)} alt="" className="h-16 w-16 rounded object-cover" />
            <button
              type="button"
              aria-label="Remover foto"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink text-xs leading-none text-parchment"
            >×</button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={i} className="h-16 w-16 animate-pulse rounded bg-ink/10" />
        ))}
        {value.length + uploading < MAX && (
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded border border-dashed border-ink/40 text-2xl opacity-60 hover:opacity-100">
            +
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPick} className="sr-only" />
          </label>
        )}
      </div>
      <span className="text-xs opacity-60">Até {MAX} fotos, JPG, PNG ou WebP, 5 MB cada.</span>
      {error && <p className="text-red-700">{error}</p>}
    </div>
  )
}
