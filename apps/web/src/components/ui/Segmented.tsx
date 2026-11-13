import { cn } from './cn'

type Props<T extends string> = { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }

// Alternador de 2 a 3 opções (ex.: Entrar / Criar conta)
export function Segmented<T extends string>({ value, onChange, options, label }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-md bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-9 rounded-[7px] text-sm font-semibold transition-colors',
            value === o.value ? 'bg-surface text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
