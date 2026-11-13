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
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-paper p-0 font-book text-[16px] text-ink-1 shadow-float backdrop:bg-ink-1/25 open:animate-rise"
    >
      <div className="flex items-start gap-2 pt-4 pr-2 pl-5">
        <h2 className="flex-1 font-display text-[24px] leading-tight font-medium">{title}</h2>
        <IconButton label="Fechar" glyph="×" onClick={onClose} />
      </div>
      <div className="px-5 pt-2 pb-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 bg-paper-2/70 px-5 py-2.5">{footer}</div>}
    </dialog>
  )
}
