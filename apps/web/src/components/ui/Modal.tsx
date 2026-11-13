import { useEffect, useRef, type ReactNode } from 'react'
import { IconButton } from './Button'
import { CloseIcon } from './icons'

type ModalProps = { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode }

// <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao botão que abriu
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
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink-900 shadow-overlay backdrop:bg-ink-900/40 backdrop:backdrop-blur-[2px] open:animate-sheet-in"
    >
      <div className="flex items-start gap-2 px-6 pt-5">
        <h2 className="flex-1 text-xl leading-tight font-semibold">{title}</h2>
        <IconButton label="Fechar" size="sm" onClick={onClose} className="-mt-1 -mr-2"><CloseIcon /></IconButton>
      </div>
      <div className="px-6 pt-3 pb-6">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line bg-paper px-6 py-3">{footer}</div>}
    </dialog>
  )
}
