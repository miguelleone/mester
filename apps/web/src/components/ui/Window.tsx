import type { ReactNode } from 'react'
import { cn } from './cn'
import { IconButton } from './Button'

type WindowProps = {
  /** nome curto na barra, ex.: "espaço.txt" */
  title: ReactNode
  /** barra branca (padrão) ou levemente cinza */
  tone?: 'dark' | 'light'
  onClose?: () => void
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
}

// Janela compacta com barra de título: o "cartão" e o "painel" do sistema
export function Window({ title, tone = 'dark', onClose, actions, children, footer, className, bodyClassName }: WindowProps) {
  return (
    <section className={cn('flex min-w-0 flex-col border border-ink-1 bg-paper shadow-window', className)}>
      <header
        className={cn(
          'flex h-8 shrink-0 items-center gap-2 pl-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase',
          'border-b border-ink-1 text-ink-1',
          tone === 'dark' ? 'bg-paper' : 'bg-paper-2',
        )}
      >
        <span aria-hidden className="text-olive-600">■</span>
        <h2 className="min-w-0 flex-1 truncate font-mono! text-[11px] font-semibold! tracking-[0.08em]">{title}</h2>
        {actions}
        {onClose && <IconButton label="Fechar" glyph="×" onClick={onClose} className="size-8 text-[16px]" />}
      </header>
      <div className={cn('min-h-0 flex-1 overflow-y-auto p-3 sm:p-4', bodyClassName)}>{children}</div>
      {footer && <footer className="shrink-0 border-t border-line bg-paper-2 px-3 py-2 sm:px-4">{footer}</footer>}
    </section>
  )
}

// Lista chave/valor, como a tabela "Key / Value" de um documento técnico
export function KeyValue({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-[minmax(96px,auto)_1fr] gap-x-4 gap-y-1', className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-ink-3">{k}</dt>
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
          <span aria-hidden className="opacity-50">{branch}</span>
          {n.href ? <a href={n.href} className="truncate hover:bg-hl hover:text-ink-1">{n.label}</a> : <span className="truncate">{n.label}</span>}
        </li>
      )
      return [row, ...(n.children ? render(n.children, `${prefix}${last ? '    ' : '│   '}`) : [])]
    })
  return <ul className={cn('font-mono text-[12px] leading-[1.6]', className)}>{render(nodes, '')}</ul>
}
