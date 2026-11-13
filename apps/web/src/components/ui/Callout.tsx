import type { ReactNode } from 'react'
import { cn } from './cn'
import { AlertIcon, CheckIcon, InfoIcon } from './icons'

type Tone = 'info' | 'success' | 'error'

const styles: Record<Tone, string> = {
  info: 'bg-river-100 text-river-700',
  success: 'bg-moss-100 text-moss-800',
  error: 'bg-terracotta-100 text-terracotta-700',
}
const icons = { info: InfoIcon, success: CheckIcon, error: AlertIcon }

// Mensagem dentro do fluxo (erro de formulário, instrução). Erros são anunciados ao leitor de tela.
export function Callout({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const Icon = icons[tone]
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={cn('flex gap-2.5 rounded-md px-3 py-2.5 text-sm', styles[tone], className)}>
      <Icon className="mt-px size-[18px] shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
