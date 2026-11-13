import { useEffect, useRef, type ReactNode } from 'react'
import { IconButton } from './Button'

type ModalProps = { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode }

// <dialog> nativo (prende o foco, fecha com Esc, devolve o foco) com cara de janela
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className="m-auto w-[calc(100%-2rem)] max-w-md border border-ink-1 bg-paper p-0 font-mono text-[13px] text-ink-1 shadow-window backdrop:bg-ink-1/30 open:animate-rise"
    >
      <div className="flex h-8 items-center gap-2 border-b border-ink-1 pl-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase">
        <span aria-hidden className="text-olive-600">■</span>
        <h2 className="flex-1 truncate font-mono! text-[11px] font-semibold!">{title}</h2>
        <IconButton label="Fechar" glyph="×" onClick={onClose} className="text-[16px]" />
      </div>
      <div className="p-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line bg-paper-2 px-4 py-2">{footer}</div>}
    </dialog>
  )
}
