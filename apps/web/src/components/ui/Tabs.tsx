import { cn } from './cn'
import { Mark } from './ink'

type Props<T extends string> = { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }

// Alternador datilografado: a opção escolhida é sublinhada à caneta (ex.: Entrar / Criar conta)
export function Tabs<T extends string>({ value, onChange, options, label }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1">
      {options.map((o, i) => (
        <span key={o.value} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-type-400">/</span>}
          <button
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-11 px-2 text-[14px] font-bold tracking-[0.1em] uppercase transition-colors',
              value === o.value ? 'text-type-900' : 'text-type-400 hover:text-type-900',
            )}
          >
            {value === o.value ? <Mark kind="underline" pen="marker" width={3}>{o.label}</Mark> : o.label}
          </button>
        </span>
      ))}
    </div>
  )
}
