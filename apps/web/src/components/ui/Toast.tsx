import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from './cn'
import { IconButton } from './Button'
import { Cursor } from './Spinner'

type Tone = 'success' | 'error' | 'info'
type Toast = { id: number; tone: Tone; message: ReactNode }

const ToastContext = createContext<((message: ReactNode, tone?: Tone) => void) | null>(null)

const prefix = { success: ['ok', 'text-olive-400'], error: ['erro', 'text-rust'], info: ['obs', 'text-stone'] } as const

let seq = 0

// Aviso como linha de terminal no rodapé: "> ok  reporte enviado ▍". Some em 5s.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))

  const show = useCallback((message: ReactNode, tone: Tone = 'success') => {
    const id = ++seq
    setToasts((t) => [...t.slice(-2), { id, tone, message }])
    setTimeout(() => dismiss(id), 5000)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] flex flex-col items-center gap-1.5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full bg-ink-1 py-1 pr-1.5 pl-4 font-mono text-[12.5px] text-paper shadow-float animate-rise"
          >
            <span aria-hidden className="text-paper/50">&gt;</span>
            <span className={cn('font-semibold', prefix[t.tone][1])}>{prefix[t.tone][0]}</span>
            <span className="min-w-0 flex-1">{t.message} <Cursor className="text-olive-400" /></span>
            <IconButton label="Fechar aviso" glyph="×" onClick={() => dismiss(t.id)} className="text-paper/70 hover:bg-paper/10 hover:text-paper" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
