import { useState, type ReactNode } from 'react'
import './showcase-fonts.css'
import { spaceTypeLabel, statusLabel, type SpaceStatus, type SpaceType } from '../api'
import {
  AsciiMap, Band, Button, Checkbox, Field, Input, KeyValue, Logo, Modal, Pixel, Select, StatusPath, StatusTag, Textarea,
  ToastProvider, Tree, Window, spaceArt, sprout, useToast, cn,
} from '../components/ui/index'

const statuses = Object.keys(statusLabel) as SpaceStatus[]
const types = Object.keys(spaceTypeLabel) as SpaceType[]

const pins = [
  { x: 0.46, y: 0.31, n: 1, status: 'com_proposta' as const },
  { x: 0.58, y: 0.58, n: 2, status: 'reportado' as const },
  { x: 0.3, y: 0.44, n: 3, status: 'em_obra' as const },
  { x: 0.2, y: 0.18, n: 4, status: 'adotado' as const },
  { x: 0.74, y: 0.8, n: 5, status: 'reportado' as const },
  { x: 0.12, y: 0.55, n: 6, status: 'reportado' as const },
  { x: 0.67, y: 0.08, n: 7, status: 'com_proposta' as const },
  { x: 0.83, y: 0.52, n: 8, status: 'adotado' as const },
  { x: 0.4, y: 0.9, n: 9, status: 'reportado' as const },
  { x: 0.53, y: 0.7, n: 10, status: 'em_obra' as const },
  { x: 0.08, y: 0.32, n: 11, status: 'reportado' as const },
  { x: 0.78, y: 0.27, n: 12, status: 'reportado' as const },
]

/* ---------- peças do showcase ---------- */

// Seção numerada em romano, como capítulos de um documento de pesquisa
function Section({ id, n, title, note, children }: { id: string; n: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-16 flex-col gap-5">
      <div className="flex items-baseline gap-3 sm:gap-4">
        <span className="w-10 shrink-0 font-book text-[26px] leading-none">{n}</span>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
          <h2 className="text-[30px] leading-none">{title}</h2>
          {note && <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">{note}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-5 sm:pl-[52px]">{children}</div>
    </section>
  )
}

function Fig({ n, caption, children, className }: { n: string; caption: ReactNode; children: ReactNode; className?: string }) {
  return (
    <figure className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="min-w-0 rounded-lg bg-paper-2 p-3 sm:p-4">{children}</div>
      <figcaption className="font-mono text-[12px] text-ink-2"><span className="font-semibold tracking-[0.08em] text-ink-1">FIG. {n}</span> {caption}</figcaption>
    </figure>
  )
}

// Bloco de pixels de cor, como o diagrama de cor da referência
function Chips({ n, name, colors }: { n: string; name: string; colors: [string, string][] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex self-start overflow-hidden rounded-md shadow-[inset_0_0_0_1px_var(--color-line)]">
        {colors.map(([hex, label]) => (
          <div key={hex} title={`${label} ${hex}`} className="size-10 border-r border-paper last:border-r-0 lg:size-12" style={{ background: hex }} />
        ))}
      </div>
      <p className="font-mono text-[12px]"><span className="text-ink-3">{n}.</span> {name}</p>
      <ul className="font-mono text-[11px] leading-[1.5] text-ink-2">
        {colors.map(([hex, label]) => <li key={hex}>{label} <span className="text-ink-3">{hex}</span></li>)}
      </ul>
    </div>
  )
}

// Celular com a tela principal: mapa ASCII + lista de faixas
function PhoneMock() {
  const [open, setOpen] = useState(3)
  const list: [string, SpaceStatus][] = [
    ['Praça Maciel Pinheiro', 'com_proposta'],
    ['Muro da Rua da Aurora', 'reportado'],
    ['Canteiro da Conde da Boa Vista', 'em_obra'],
    ['Jardim do Derby', 'adotado'],
  ]
  return (
    <div className="mx-auto w-[300px] shrink-0 rounded-[38px] border border-ink-3/40 bg-[#e9e8e3] p-2 shadow-window">
      <div className="h-[600px] overflow-hidden rounded-[30px] border-[6px] border-ink-1 bg-paper">
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <Logo className="text-[22px]" />
          <span className="font-mono flex items-center gap-1 text-[11px]">
            <span className="rounded-full bg-st-adotado px-2.5 py-0.5">Menu</span>
            <span className="flex size-5 items-center justify-center rounded-full bg-st-adotado">+</span>
          </span>
        </div>
        <div className="mx-2 rounded-md bg-paper-2 px-1 py-1">
          <AsciiMap rows={24} size={7.5} pins={pins.slice(0, 4)} />
        </div>
        <p className="font-mono px-3 pt-2 pb-1 text-[10px] tracking-[0.08em] text-ink-2 uppercase">4 espaços perto de você</p>
        {list.map(([name, st], i) => (
          <Band key={name} n={i + 1} title={name} status={st} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
            <div className="font-mono flex flex-col gap-1.5 text-[11px]">
              <p className="font-book text-[14px] leading-snug">Mato alto perto do coreto e dois bancos quebrados.</p>
              <p><span aria-hidden>→ </span>12 reportes · desde 3 out</p>
              <p><span aria-hidden>→ </span>Seu Antônio, jardineiro</p>
              <p className="text-ink-2">[ <span className="underline">ver diário da obra</span> ]</p>
            </div>
          </Band>
        ))}
      </div>
    </div>
  )
}

// Diagrama de hipertexto: a jornada como nós ligados por setas rotuladas
function JourneyGraph() {
  const nodes = [
    { id: 'm', x: 10, y: 20, w: 124, label: 'morador', sub: 'reporta + fotos' },
    { id: 'r', x: 248, y: 20, w: 124, label: '■ reportado', st: 'reportado' as const },
    { id: 'p', x: 486, y: 20, w: 124, label: '■ com proposta', st: 'com_proposta' as const },
    { id: 'a', x: 486, y: 140, w: 124, label: 'adotante', sub: 'quer adotar' },
    { id: 'o', x: 248, y: 140, w: 124, label: '■ em obra', st: 'em_obra' as const },
    { id: 's', x: 10, y: 140, w: 124, label: 'prestador', sub: 'diário c/ fotos' },
    { id: 'd', x: 248, y: 250, w: 124, label: '■ adotado', st: 'adotado' as const },
  ]
  const fill: Record<SpaceStatus, string> = { reportado: '#c58f72', com_proposta: '#cdb97e', em_obra: '#a7b3b9', adotado: '#a5ad7c' }
  const at = (id: string) => nodes.find((n) => n.id === id)!
  const links: [string, string, string][] = [['m', 'r', 'marca no mapa'], ['r', 'p', 'gestor analisa'], ['p', 'a', 'orçamento'], ['a', 'o', 'contrata'], ['s', 'o', 'executa'], ['o', 'd', 'antes e depois']]
  const anchor = (a: (typeof nodes)[number], b: (typeof nodes)[number]) => {
    const ac = [a.x + a.w / 2, a.y + 20], bc = [b.x + b.w / 2, b.y + 20]
    if (Math.abs(ac[1] - bc[1]) < 5) return [ac[0] < bc[0] ? a.x + a.w : a.x, ac[1], ac[0] < bc[0] ? b.x : b.x + b.w, bc[1]]
    if (Math.abs(ac[0] - bc[0]) < 5) return [ac[0], ac[1] < bc[1] ? a.y + 40 : a.y, bc[0], ac[1] < bc[1] ? b.y : b.y + 40]
    return [ac[0], a.y + 40, bc[0] + (ac[0] < bc[0] ? -20 : 20), b.y]
  }
  return (
    <div className="dot-paper overflow-x-auto rounded-lg bg-paper-2/50 p-2">
      <svg viewBox="0 0 620 300" className="block w-full max-w-[680px] min-w-[560px] font-mono text-[11px]" role="img" aria-label="Jornada: morador reporta, gestor analisa, adotante contrata, prestador executa, espaço adotado">
        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" fill="#77716a" />
          </marker>
        </defs>
        {links.map(([a, b, label]) => {
          const [x1, y1, x2, y2] = anchor(at(a), at(b))
          return (
            <g key={a + b}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#77716a" strokeWidth="1" markerEnd="url(#arr)" />
              {y1 === y2
                ? <text x={(x1 + x2) / 2} y={y1 - 6} textAnchor="middle" fill="#5a554c">{label}</text>
                : <text x={x1 + 6} y={(y1 + y2) / 2 + 4} fill="#5a554c">{label}</text>}
            </g>
          )
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={n.w} height={40} rx={7} fill={n.st ? fill[n.st] : '#ffffff'} />
                        <text x={n.x + 9} y={n.y + 16} fill="#1d1a16" fontWeight="600">{n.label}</text>
            {n.sub && <text x={n.x + 9} y={n.y + 31} fill="#5a554c">{n.sub}</text>}
          </g>
        ))}
      </svg>
    </div>
  )
}

const index = [
  { label: 'mester', children: [
    { label: 'I. abertura', href: '#abertura' },
    { label: 'II. a tela', href: '#tela' },
    { label: 'III. cores', href: '#cores' },
    { label: 'IV. tipos', href: '#tipos' },
    { label: 'V. componentes', href: '#componentes', children: [
      { label: 'botões', href: '#botoes' }, { label: 'campos', href: '#campos' }, { label: 'status', href: '#status' }, { label: 'janelas', href: '#janelas' },
    ] },
    { label: 'VI. ilustrações', href: '#ilustracoes' },
    { label: 'VII. jornada', href: '#jornada' },
  ] },
]

/* ---------- página ---------- */

function Demo() {
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="ds min-h-dvh">
      {/* Barra de topo */}
      <div className="sticky top-0 z-50 flex h-11 items-center gap-2 bg-paper/95 px-4 backdrop-blur">
        <Logo className="text-[22px]" />
        <span className="ml-2 rounded-full bg-paper-2 px-2.5 py-0.5 font-mono text-[11px] tracking-[0.06em] text-ink-2 uppercase">sistema visual</span>
        <span className="rounded-full bg-st-adotado px-2.5 py-0.5 font-mono text-[11px] tracking-[0.06em] uppercase">v0.6 · wip</span>
        <span className="ml-auto hidden font-mono text-[11px] tracking-[0.06em] text-ink-3 uppercase sm:inline">Recife · nov 2026</span>
      </div>

      <div className="md:grid md:grid-cols-[232px_1fr]">
        {/* Índice em árvore ASCII */}
        <aside className="bg-paper px-4 py-3 text-ink-1 md:sticky md:top-11 md:h-[calc(100dvh-2.75rem)] md:overflow-y-auto">
          <details className="md:hidden">
            <summary className="font-mono cursor-pointer text-[12px]">▸ índice</summary>
            <Tree nodes={index} className="mt-2" />
          </details>
          <div className="hidden flex-col gap-6 md:flex">
            <Tree nodes={index} />
            <div className="font-mono flex flex-col gap-1 text-[11px] text-ink-2">
              <p className="text-ink-1">legenda</p>
              {statuses.map((s) => <StatusTag key={s} status={s} className="self-start" />)}
            </div>
            <Pixel art={sprout} className="mt-auto w-10" />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mx-auto flex max-w-[980px] flex-col gap-16 px-4 py-10 sm:px-8">

            <Section id="abertura" n="I" title="Abertura" note="o que é o mester">
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <div className="flex flex-col gap-4">
                  <p className="max-w-[26ch] font-display text-[28px] leading-[1.18] sm:text-[36px]">
                    “Espaços da cidade à espera de cuidado, e as pessoas que podem cuidar deles.”
                  </p>
                  <p className="max-w-[62ch] text-ink-2">
                    O morador marca no mapa a praça abandonada, alguém do bairro adota e um prestador local executa a obra.
                    A interface é compacta como um caderno de pesquisa: títulos em gótica serifada, textos em Garamond, rótulos e dados em mono, status em faixas de cor chapada e o mapa inteiro desenhado em caracteres.
                  </p>
                  <KeyValue
                    className="max-w-md"
                    rows={[
                      ['cidade', 'Recife, PE'],
                      ['espaços', '128 reportados · 9 adotados'],
                      ['fase', 'MVP de adoção'],
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1 text-[15px] text-ink-2">
                  <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-1 uppercase">Ideia central</p>
                  <p>O mapa deixa de ser um tile genérico: ruas viram ─ │, rios viram ~, praças viram ♣ e cada espaço vira um [01] na cor da sua etapa.</p>
                </div>
              </div>
              <Fig n="01" caption="Centro do Recife desenhado em caracteres. Cada [nº] é um espaço reportado, na cor da etapa em que está; quadras, árvores, avenidas e bairros dão a densidade da cidade.">
                <AsciiMap rows={44} size={10} pins={pins} />
              </Fig>
            </Section>

            <Section id="tela" n="II" title="A tela" note="celular primeiro">
              <div className="grid items-start gap-8 md:grid-cols-[300px_1fr]">
                <PhoneMock />
                <div className="flex flex-col gap-4">
                  <Window title="como a tela funciona" tone="flat">
                    <ul className="flex flex-col gap-2">
                      <li><span aria-hidden>→ </span>O mapa ASCII ocupa o topo; os espaços aparecem como [01], [02]...</li>
                      <li><span aria-hidden>→ </span>Abaixo, a lista em faixas numeradas na cor do status, como um índice.</li>
                      <li><span aria-hidden>→ </span>Tocar numa faixa abre os detalhes ali mesmo, sem trocar de tela.</li>
                      <li><span aria-hidden>→ </span>Ações ficam entre colchetes: <span className="whitespace-nowrap">[ quero adotar ]</span>.</li>
                    </ul>
                  </Window>
                  <Hint>Toque nas faixas do celular ao lado para abrir e fechar.</Hint>
                </div>
              </div>
            </Section>

            <Section id="cores" n="III" title="Cores" note="neutras: terra, musgo e pedra">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                <Chips n="01" name="papel e tinta" colors={[['#ffffff', 'papel'], ['#f6f4ef', 'papel 2'], ['#5a554c', 'tinta 2'], ['#1d1a16', 'tinta']]} />
                <Chips n="02" name="crema a café" colors={[['#efe9dc', 'terra 100'], ['#d6c9b0', 'terra 300'], ['#8a7358', 'terra 500'], ['#4a3a2c', 'terra 700']]} />
                <Chips n="03" name="musgo" colors={[['#e6e7d6', 'oliva 100'], ['#a5ad7c', 'oliva 400'], ['#6b7440', 'oliva 600'], ['#3e4a1c', 'oliva 800']]} />
                <Chips n="04" name="pedras" colors={[['#a7b3b9', 'pedra'], ['#5f6f7c', 'ardósia · água'], ['#c58f72', 'ferrugem'], ['#cdb97e', 'ocre']]} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[12px]"><span className="text-ink-3">05.</span> faixas de status</p>
                <div className="flex flex-col overflow-hidden rounded-lg">
                  {statuses.map((s, i) => <Band key={s} n={i + 1} title={statusLabel[s]} status={s} />)}
                </div>
              </div>
            </Section>

            <Section id="tipos" n="IV" title="Tipos" note="gótica, Garamond e mono">
              <div className="flex flex-col">
                {[
                  ['Títulos', 'Grenze Gotisch 500', <p className="font-display text-[40px] leading-none font-medium">Praça Maciel Pinheiro</p>],
                  ['Textos', 'EB Garamond 16–17px', <p className="max-w-[52ch] font-book text-[17px] leading-snug">Mato alto perto do coreto e dois bancos quebrados. As crianças da escola ao lado usam a praça todo fim de tarde.</p>],
                  ['Rótulos e dados', 'JetBrains Mono 11–12px', <p className="font-mono text-[12px]">Enviar reporte · 12 reportes · -8.0631, -34.8711</p>],
                  ['Etiquetas', 'Mono 11px caixa alta', <p className="font-mono text-[11px] tracking-[0.08em] uppercase">Nome do espaço · status · fotos</p>],
                ].map(([k, sub, sample]) => (
                  <div key={k as string} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div><p>{k}</p><p className="font-mono text-[11px] text-ink-3">{sub}</p></div>
                    <div className="min-w-0">{sample}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <Label>outras opções para títulos</Label>
                {[
                  ['Grenze 500', '"Grenze"', 'mais romana, ainda vertical'],
                  ['Texturina 500', '"Texturina Variable"', 'gótica mais aberta e leve'],
                  ['Uncial Antiqua', '"Uncial Antiqua"', 'a da v0.3'],
                ].map(([n, f, d]) => (
                  <div key={n} className="grid gap-1 py-2 sm:grid-cols-[180px_1fr] sm:items-baseline">
                    <div><p>{n}</p><p className="font-mono text-[11px] text-ink-3">{d}</p></div>
                    <p className="text-[30px] leading-none font-medium" style={{ fontFamily: f }}>Praça Maciel Pinheiro</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="componentes" n="V" title="Componentes" note="compactos, sem bordas">
              <div id="botoes" className="flex scroll-mt-16 flex-col gap-3">
                <Label>botões</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button glyph="+">Reportar espaço</Button>
                  <Button variant="secondary">Ver proposta</Button>
                  <Button variant="link">quero adotar</Button>
                  <Button variant="danger">Remover</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Pequeno</Button>
                  <Button size="sm" variant="secondary" glyph="→">Abrir no mapa</Button>
                  <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1800) }}>
                    {loading ? 'Enviando' : 'Clique p/ carregar'}
                  </Button>
                  <Button disabled>Desabilitado</Button>
                </div>
                <Hint>Pílulas sem borda; hover clareia, Tab mostra o contorno de foco em musgo.</Hint>
              </div>

              <div id="campos" className="grid scroll-mt-16 items-start gap-5 lg:grid-cols-[1fr_320px]">
                <Window title="reportar_espaco.txt">
                  <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); toast('reporte enviado. obrigado por cuidar da cidade.') }}>
                    <Field inline label="Nome" error="mínimo de 3 caracteres"><Input defaultValue="Pç" /></Field>
                    <Field inline label="Tipo">
                      <Select defaultValue="praca">{types.map((t) => <option key={t} value={t}>{spaceTypeLabel[t]}</option>)}</Select>
                    </Field>
                    <Field inline label="O que acontece" hint="lixo, mato alto, pichação, bancos quebrados...">
                      <Textarea rows={3} defaultValue="Mato alto perto do coreto e dois bancos quebrados." />
                    </Field>
                    <Field inline label="Referência" optional><Input placeholder="ex.: em frente à escola" /></Field>
                    <div className="sm:pl-[148px]"><Checkbox label="É um espaço público" description="praças, canteiros e muros da prefeitura" defaultChecked /></div>
                    <div className="flex flex-wrap gap-2 sm:pl-[148px]"><Button>Enviar reporte</Button><Button type="button" variant="link">cancelar</Button></div>
                  </form>
                </Window>
                <Window title="entrar">
                  <div className="flex flex-col gap-3">
                    <div role="radiogroup" aria-label="Acesso" className="font-mono flex rounded-full bg-paper-2 p-0.5 text-[12px]">
                      {(['login', 'cadastro'] as const).map((m) => (
                        <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}
                          className={cn('h-7 flex-1 rounded-full transition-colors', mode === m ? 'bg-paper shadow-soft' : 'text-ink-2 hover:text-ink-1')}>
                          {m === 'login' ? 'entrar' : 'criar conta'}
                        </button>
                      ))}
                    </div>
                    {mode === 'cadastro' && <Field label="Nome"><Input /></Field>}
                    <Field label="Email"><Input type="email" placeholder="voce@email.com" /></Field>
                    <Field label="Senha" hint={mode === 'cadastro' ? 'mínimo de 8 caracteres' : undefined}><Input type="password" /></Field>
                    {mode === 'cadastro' && (
                      <Field label="Você é">
                        <Select defaultValue="morador">
                          <option value="morador">morador</option><option value="adotante">quer adotar um espaço</option><option value="prestador">prestador de serviço</option>
                        </Select>
                      </Field>
                    )}
                    <Button block>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
                  </div>
                </Window>
              </div>

              <div id="status" className="flex scroll-mt-16 flex-col gap-3">
                <Label>status</Label>
                <div className="flex flex-wrap gap-1.5">{statuses.map((s) => <StatusTag key={s} status={s} />)}</div>
                <div className="flex flex-col gap-2">{statuses.map((s) => <StatusPath key={s} status={s} />)}</div>
              </div>

              <div id="janelas" className="grid scroll-mt-16 items-start gap-5 lg:grid-cols-[380px_1fr]">
                <Window
                  title="espaço · jardim do derby"
                  onClose={() => toast('fecharia o painel', 'info')}
                  footer={<div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => setModal(true)}>Quero adotar</Button><Button size="sm" variant="link">diário da obra</Button></div>}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Pixel art={spaceArt.jardim} className="size-12 shrink-0" title="Jardim" />
                      <div className="min-w-0">
                        <h3 className="text-[24px] leading-tight">Jardim do Derby</h3>
                        <p className="font-mono text-[11px] tracking-[0.08em] text-ink-2 uppercase">jardim · público</p>
                      </div>
                    </div>
                    <StatusPath status="em_obra" />
                    <KeyValue rows={[['reportes', '3'], ['adotante', 'Assoc. Moradores do Derby'], ['prestador', 'Seu Antônio, jardineiro'], ['local', '-8.0569, -34.8987']]} />
                    <div className="flex flex-col gap-3 border-t border-line pt-3">
                      {[['Ana Lima', 'Mato alto e bancos quebrados perto do coreto.'], ['João Melo', 'Lixo acumulado na entrada da Rua do Futuro.']].map(([n, d]) => (
                        <div key={n} className="flex flex-col gap-1">
                          <p className="font-book text-[16px] leading-snug">{d}</p>
                          <div className="flex gap-1">
                            {['#d6c9b0', '#a5ad7c', '#a7b3b9'].map((c) => <div key={c} className="size-14 rounded-sm" style={{ background: c }} />)}
                          </div>
                          <p className="font-mono text-[11px] text-ink-3">{n} · 2 nov 2026</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Window>
                <div className="flex flex-col gap-3">
                  <Label>janelas, modal e avisos</Label>
                  <p className="max-w-[56ch] text-ink-2">O painel do espaço é uma folha branca que flutua sobre o mapa, sem borda. No celular ela sobe de baixo, sobre o mapa; no computador fica fixa à direita.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setModal(true)}>Abrir modal</Button>
                    <Button variant="secondary" size="sm" onClick={() => toast('reporte enviado. obrigado por cuidar da cidade.')}>Aviso ok</Button>
                    <Button variant="secondary" size="sm" onClick={() => toast('a imagem pode ter no máximo 5 MB', 'error')}>Aviso de erro</Button>
                  </div>
                  <Hint>Os avisos aparecem no rodapé como uma linha de terminal.</Hint>
                </div>
              </div>
            </Section>

            <Section id="ilustracoes" n="VI" title="Ilustrações" note="pixel, um por tipo de espaço">
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                <Fig n="02" caption="a marca"><Pixel art={sprout} className="mx-auto aspect-square w-full p-2" title="Broto, a marca do Mester" /></Fig>
                {types.map((t, i) => (
                  <Fig key={t} n={String(i + 3).padStart(2, '0')} caption={spaceTypeLabel[t].toLowerCase()}>
                    <Pixel art={spaceArt[t]} className="aspect-square w-full p-1" title={spaceTypeLabel[t]} />
                  </Fig>
                ))}
              </div>
              <Hint>Aparecem no cabeçalho do espaço, nos estados vazios e no mapa quando você aproxima.</Hint>
            </Section>

            <Section id="jornada" n="VII" title="Jornada" note="quem faz o quê">
              <JourneyGraph />
            </Section>

            <footer className="font-mono flex items-center gap-3 pt-3 text-[11px] text-ink-3">
              <Pixel art={sprout} className="w-5" />
              <span>mester · sistema visual v0.6 · proposta para aprovação</span>
            </footer>
          </div>
        </main>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Quero adotar este espaço"
        footer={<>
          <Button variant="link" onClick={() => setModal(false)}>cancelar</Button>
          <Button size="sm" onClick={() => { setModal(false); toast('interesse registrado') }}>Confirmar</Button>
        </>}
      >
        <p className="font-book text-[17px] leading-snug">
          A equipe do Mester prepara uma proposta com plano de trabalho e orçamento e te envia em até 5 dias úteis. Nada é cobrado agora.
        </p>
      </Modal>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">{children}</p>
}
function Hint({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-ink-3 italic"><span aria-hidden className="not-italic">※ </span>{children}</p>
}

export function Showcase() {
  return <ToastProvider><Demo /></ToastProvider>
}
