import { useEffect, useRef, type ReactNode } from 'react'
import { CloseMark, IconButton } from './Button'
import { Tape } from './ink'

type ModalProps = { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode }

// <dialog> nativo (prende o foco, fecha com Esc, devolve o foco) com cara de folha colada
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
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-visible border border-rule/70 bg-paper p-0 font-type text-type-900 shadow-lifted [--tilt:0.6deg] backdrop:bg-type-900/30 open:rotate-[0.6deg] open:animate-drop-in"
    >
      <Tape className="-top-3 left-6 -rotate-3" />
      <div className="flex items-start gap-2 px-6 pt-6">
        <h2 className="flex-1 text-xl leading-tight font-bold">{title}</h2>
        <IconButton label="Fechar" size="sm" onClick={onClose} className="-mt-1 -mr-2"><CloseMark /></IconButton>
      </div>
      <div className="px-6 pt-3 pb-6">{children}</div>
      {footer && <div className="flex justify-end gap-3 border-t border-dashed border-type-400 px-6 py-3">{footer}</div>}
    </dialog>
  )
}
