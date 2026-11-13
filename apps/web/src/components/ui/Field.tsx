import {
  createContext, useContext, useId,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn'

type Ctx = { id: string; describedBy?: string; invalid: boolean }
const FieldContext = createContext<Ctx | null>(null)

type FieldProps = {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  /** rótulo à esquerda (tabela chave/valor) a partir de sm */
  inline?: boolean
  children: ReactNode
  className?: string
}

// Campo compacto: rótulo mono em caixa alta, dica e erro ligados por aria
export function Field({ label, hint, error, optional, inline, children, className }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>
      <div className={cn('grid gap-1', inline && 'sm:grid-cols-[136px_1fr] sm:gap-x-3', className)}>
        <label htmlFor={id} className={cn('text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase', inline && 'sm:pt-2.5')}>
          {label}
          {optional && <span className="ml-1 font-normal tracking-normal text-ink-3 normal-case">opcional</span>}
        </label>
        <div className="flex min-w-0 flex-col gap-1">
          {children}
          {hint && !error && <p id={hintId} className="text-[12px] text-ink-3">{hint}</p>}
          {error && <p id={errorId} className="text-[12px] font-medium text-alert">! {error}</p>}
        </div>
      </div>
    </FieldContext.Provider>
  )
}

function useField(id?: string) {
  const ctx = useContext(FieldContext)
  return {
    id: id ?? ctx?.id,
    'aria-describedby': ctx?.describedBy,
    'aria-invalid': ctx?.invalid || undefined,
  }
}

// 16px no celular evita o zoom automático do iOS ao focar; 13px no desktop, compacto
const control = cn(
  'w-full rounded-none border border-line bg-paper px-2.5 text-base text-ink-1 sm:text-[13px]',
  'placeholder:text-ink-3 transition-colors hover:border-ink-3',
  'focus-visible:border-ink-1 aria-invalid:border-alert',
  'disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-3',
)

export function Input({ className, id, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...useField(id)} {...rest} className={cn(control, 'h-9 font-mono', className)} />
}

// Texto livre das pessoas vai em Garamond: é para ler, não para operar
export function Textarea({ className, id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...useField(id)}
      rows={4}
      {...rest}
      className={cn(control, 'resize-y py-1.5 font-book text-[17px] leading-snug sm:text-[16px]', className)}
    />
  )
}

export function Select({ className, id, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select {...useField(id)} {...rest} className={cn(control, 'h-9 cursor-pointer appearance-none pr-7 font-mono')}>
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px]">▾</span>
    </div>
  )
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode }

// Caixa de seleção em ASCII: [ ] / [x]
export function Checkbox({ label, description, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2 py-1', className)}>
      <input type="checkbox" {...rest} className="peer sr-only" />
      <span aria-hidden className="shrink-0 font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-pink peer-checked:[&>i]:visible">
        [<i className="invisible not-italic">x</i>]
      </span>
      <span className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-[12px] text-ink-3">{description}</span>}
      </span>
    </label>
  )
}
