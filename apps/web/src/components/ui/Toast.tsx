import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from './cn'
import { IconButton } from './Button'
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './icons'

type Tone = 'success' | 'error' | 'info'
type Toast = { id: number; tone: Tone; message: ReactNode }

const ToastContext = createContext<((message: ReactNode, tone?: Tone) => void) | null>(null)

const icon = { success: CheckIcon, error: AlertIcon, info: InfoIcon }
const iconColor = { success: 'text-moss-300', error: 'text-[#f0a48f]', info: 'text-river-100' }

let seq = 0

// Avisos rápidos no rodapé (acima da folha no celular); somem sozinhos em 5s
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
        {toasts.map((t) => {
          const Icon = icon[t.tone]
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg bg-ink-900 py-2 pr-2 pl-4 text-[15px] text-white shadow-overlay animate-toast-in"
            >
              <Icon className={cn('size-5 shrink-0', iconColor[t.tone])} />
              <span className="flex-1">{t.message}</span>
              <IconButton label="Fechar aviso" size="sm" onClick={() => dismiss(t.id)} className="text-white/70 hover:bg-white/10 hover:text-white">
                <CloseIcon className="size-4" />
              </IconButton>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
