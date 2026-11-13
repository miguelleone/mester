import type { ReactNode } from 'react'
import { cn } from './cn'
import { Hand, type Pen } from './ink'

type Tone = 'info' | 'success' | 'error'
const pen: Record<Tone, Pen> = { info: 'blue', success: 'green', error: 'red' }
const bar: Record<Tone, string> = { info: 'border-pen-blue', success: 'border-pen-green', error: 'border-pen-red' }

// Recado à mão no fluxo (instrução, erro de envio). Erros são anunciados ao leitor de tela.
export function Note({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={cn('border-l-2 py-0.5 pl-3', bar[tone], className)}>
      <Hand pen={pen[tone]} tilt={-0.8} className="text-[22px]">{children}</Hand>
    </div>
  )
}
