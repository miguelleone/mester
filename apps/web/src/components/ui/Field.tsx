import {
  createContext, useContext, useId,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn'
import { Arrow, Check, Hand } from './ink'

type Ctx = { id: string; describedBy?: string; invalid: boolean }
const FieldContext = createContext<Ctx | null>(null)

type FieldProps = { label: ReactNode; hint?: ReactNode; error?: ReactNode; optional?: boolean; children: ReactNode; className?: string }

/*
 * Campo de formulário datilografado: rótulo em caixa alta, linha para preencher.
 * O erro aparece como correção à mão em caneta vermelha, apontando para o campo.
 */
export function Field({ label, hint, error, optional, children, className }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>
      <div className={cn('flex flex-col gap-1', className)}>
        <label htmlFor={id} className="text-[13px] font-bold tracking-[0.1em] text-type-600 uppercase">
          {label}
          {optional && <span className="ml-1.5 font-normal tracking-normal normal-case italic">(opcional)</span>}
        </label>
        {children}
        {hint && !error && <p id={hintId} className="text-[14px] text-type-600 italic">{hint}</p>}
        {error && (
          <p id={errorId} className="flex items-start gap-1 pt-0.5">
            <Arrow pen="red" className="mt-1 w-7 shrink-0 -scale-x-100 rotate-[-15deg]" />
            <Hand pen="red" tilt={-1.5} className="text-[21px]">{error}</Hand>
          </p>
        )}
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

// Linha de formulário: só a borda de baixo. Foco pinta de marca-texto.
const line = cn(
  'w-full rounded-none border-0 border-b-2 border-type-900 bg-transparent px-1 font-type text-base text-type-900',
  'placeholder:text-type-400 placeholder:italic transition-colors',
  'focus-visible:border-marker focus-visible:bg-marker-soft/35 focus-visible:outline-none',
  'aria-invalid:border-pen-red',
  'disabled:cursor-not-allowed disabled:border-dashed disabled:border-type-400 disabled:text-type-400',
)

export function Input({ className, id, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...useField(id)} {...rest} className={cn(line, 'h-11', className)} />
}

// Área de escrita em folha pautada, com a margem vermelha de caderno
export function Textarea({ className, id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...useField(id)}
      rows={4}
      {...rest}
      className={cn(
        'ruled w-full resize-y rounded-none border-0 border-l-2 border-pen-red/50 bg-paper py-0 pr-2 pl-3 font-type text-base text-type-900',
        'placeholder:text-type-400 placeholder:italic',
        'focus-visible:bg-marker-soft/20 aria-invalid:border-pen-red',
        className,
      )}
    />
  )
}

export function Select({ className, id, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select {...useField(id)} {...rest} className={cn(line, 'h-11 cursor-pointer appearance-none pr-9')}>
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 20 12" className="pointer-events-none absolute top-1/2 right-1.5 w-4 -translate-y-1/2 text-type-900">
        <path d="M2 2 C 6 6, 8 9, 10 10 C 13 7, 15 4, 18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode }

// Quadradinho de formulário que recebe um visto de caneta
export function Checkbox({ label, description, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 py-1', className)}>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" {...rest} className="peer block size-5 cursor-pointer appearance-none border-2 border-type-900 bg-paper" />
        <Check pen="blue" className="pointer-events-none absolute -top-2 left-0.5 hidden size-6 peer-checked:block" />
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] text-type-900">{label}</span>
        {description && <span className="text-[14px] text-type-600 italic">{description}</span>}
      </span>
    </label>
  )
}
