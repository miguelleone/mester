import { useState, type ChangeEvent } from 'react'
import { photoUrl, uploadPhoto } from '../api'
import { useAuth } from '../auth'
import { Spinner } from './ui'

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
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative">
            <img src={photoUrl(url)} alt={`Foto ${i + 1}`} className="size-16 rounded-md object-cover" />
            <button
              type="button"
              aria-label={`Remover foto ${i + 1}`}
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink-1 font-mono text-[12px] text-paper shadow-soft hover:bg-alert"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={i} className="flex size-16 items-center justify-center rounded-md bg-paper-2 font-mono text-[14px] text-ink-2">
            <Spinner />
          </div>
        ))}
        {value.length + uploading < MAX && (
          <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-md bg-paper-2 font-mono text-ink-2 transition-colors hover:bg-hl hover:text-ink-1 has-focus-visible:outline-2 has-focus-visible:outline-focus">
            <span aria-hidden className="text-[18px] leading-none">+</span>
            <span className="text-[10.5px] tracking-[0.06em] uppercase">foto</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPick} className="sr-only" />
          </label>
        )}
      </div>
      <p className="text-[14px] text-ink-3 italic">Até {MAX} fotos, JPG, PNG ou WebP, 5 MB cada.</p>
      {error && <p role="alert" className="text-[14px] text-alert"><span className="font-mono text-[12px] font-bold">! </span>{error}</p>}
    </div>
  )
}
