import {
  createContext, useContext, useId,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn'
import { ChevronDown } from './icons'

type Ctx = { id: string; describedBy?: string; invalid: boolean }
const FieldContext = createContext<Ctx | null>(null)

type FieldProps = { label: ReactNode; hint?: ReactNode; error?: ReactNode; optional?: boolean; children: ReactNode; className?: string }

// Envolve um controle com rótulo, dica e erro já ligados por id/aria
export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className="text-sm font-semibold text-ink-900">
          {label}
          {optional && <span className="ml-1 font-normal text-ink-500">(opcional)</span>}
        </label>
        {children}
        {hint && !error && <p id={hintId} className="text-[13px] text-ink-500">{hint}</p>}
        {error && <p id={errorId} className="text-[13px] font-medium text-terracotta-700">{error}</p>}
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

// 16px no celular evita o zoom automático do iOS ao focar
export const controlBase = cn(
  'w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink-900 shadow-[inset_0_1px_2px_rgb(31_26_20/0.05)] sm:text-[15px]',
  'placeholder:text-ink-300 transition-colors hover:border-ink-300',
  'focus-visible:border-moss-500 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-moss-300/60',
  'aria-invalid:border-terracotta-500 aria-invalid:focus-visible:ring-terracotta-100',
  'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-500',
)

export function Input({ className, id, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...useField(id)} {...rest} className={cn(controlBase, 'h-11', className)} />
}

export function Textarea({ className, id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...useField(id)} rows={4} {...rest} className={cn(controlBase, 'min-h-24 resize-y py-2.5 leading-relaxed', className)} />
}

export function Select({ className, id, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select {...useField(id)} {...rest} className={cn(controlBase, 'h-11 appearance-none pr-10')}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-500" />
    </div>
  )
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode }

export function Checkbox({ label, description, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 py-1', className)}>
      <input type="checkbox" {...rest} className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-moss-700" />
      <span className="flex flex-col">
        <span className="text-[15px] text-ink-900">{label}</span>
        {description && <span className="text-[13px] text-ink-500">{description}</span>}
      </span>
    </label>
  )
}
