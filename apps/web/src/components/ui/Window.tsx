import type { ReactNode } from 'react'
import { cn } from './cn'
import { IconButton } from './Button'

type WindowProps = {
  /** rótulo curto no topo, ex.: "espaço · jardim do derby" */
  title: ReactNode
  /** papel branco flutuando (padrão) ou superfície recuada, sem sombra */
  tone?: 'float' | 'flat'
  onClose?: () => void
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
}

// Painel suave: sem borda preta, cantos arredondados e um rótulo mono discreto no topo
export function Window({ title, tone = 'float', onClose, actions, children, footer, className, bodyClassName }: WindowProps) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-lg', tone === 'float' ? 'bg-paper shadow-soft' : 'bg-paper-2', className)}>
      <header className="flex h-9 shrink-0 items-center gap-2 pr-1.5 pl-4">
        <span aria-hidden className="size-1.5 rounded-full bg-olive-600" />
        <h2 className="min-w-0 flex-1 truncate font-mono! text-[11px] font-semibold! tracking-[0.08em] text-ink-2 uppercase">{title}</h2>
        {actions}
        {onClose && <IconButton label="Fechar" glyph="×" onClick={onClose} />}
      </header>
      <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 pb-4', bodyClassName)}>{children}</div>
      {footer && <footer className="shrink-0 bg-paper-2/70 px-4 py-2.5">{footer}</footer>}
    </section>
  )
}

// Lista chave/valor: chave em mono pequena, valor em Garamond
export function KeyValue({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-[minmax(88px,auto)_1fr] items-baseline gap-x-4 gap-y-1', className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase">{k}</dt>
          <dd className="min-w-0">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export type TreeNode = { label: ReactNode; href?: string; children?: TreeNode[] }

// Árvore ASCII (├── └──) para índices e navegação
export function Tree({ nodes, className }: { nodes: TreeNode[]; className?: string }) {
  const render = (list: TreeNode[], prefix: string): ReactNode[] =>
    list.flatMap((n, i) => {
      const last = i === list.length - 1
      const branch = `${prefix}${last ? '└── ' : '├── '}`
      const row = (
        <li key={`${prefix}${i}`} className="flex whitespace-pre">
          <span aria-hidden className="opacity-40">{branch}</span>
          {n.href ? <a href={n.href} className="truncate rounded-sm px-0.5 hover:bg-hl hover:text-ink-1">{n.label}</a> : <span className="truncate">{n.label}</span>}
        </li>
      )
      return [row, ...(n.children ? render(n.children, `${prefix}${last ? '    ' : '│   '}`) : [])]
    })
  return <ul className={cn('font-mono text-[12px] leading-[1.6]', className)}>{render(nodes, '')}</ul>
}
