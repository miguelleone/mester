import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CloseMark, IconButton } from './Button'
import { Hand } from './ink'

type Tone = 'success' | 'error' | 'info'
type Toast = { id: number; tone: Tone; message: ReactNode }

const ToastContext = createContext<((message: ReactNode, tone?: Tone) => void) | null>(null)

const lead = { success: { pen: 'green', word: 'feito!' }, error: { pen: 'red', word: 'ops!' }, info: { pen: 'blue', word: 'obs.' } } as const

let seq = 0

// Tira de papel que aparece no rodapé: palavra à mão + recado datilografado. Some em 5s.
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
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm rotate-[-0.8deg] items-center gap-3 border border-rule/70 bg-paper py-1.5 pr-1.5 pl-4 font-type text-[15px] text-type-900 shadow-lifted animate-strip-in"
          >
            <Hand pen={lead[t.tone].pen} tilt={-4} className="shrink-0 text-[24px]">{lead[t.tone].word}</Hand>
            <span className="flex-1">{t.message}</span>
            <IconButton label="Fechar aviso" size="sm" onClick={() => dismiss(t.id)}><CloseMark className="text-[24px]" /></IconButton>
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
