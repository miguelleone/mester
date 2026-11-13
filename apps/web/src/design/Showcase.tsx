import { useState, type ReactNode } from 'react'
import { statusLabel, type SpaceStatus } from '../api'
import {
  Badge, Button, Callout, Card, Checkbox, Field, Input, Logo, Modal, Ornament, Panel, Segmented, Select,
  StatusBadge, StatusSteps, Textarea, ToastProvider, useToast, CameraIcon, PinIcon, PlusIcon, statusTone, cn,
} from '../components/ui/index'

const statuses = Object.keys(statusLabel) as SpaceStatus[]

const palette: { group: string; note: string; colors: [string, string, string][] }[] = [
  {
    group: 'Papel e tinta', note: 'Fundo quente, texto de alto contraste',
    colors: [
      ['paper', '#fbf8f1', 'Fundo'], ['surface', '#ffffff', 'Cartões'], ['sunken', '#f3eee2', 'Áreas recuadas'],
      ['line', '#e3dccd', 'Bordas'], ['ink-500', '#6b6052', 'Texto secundário'], ['ink-900', '#1f1a14', 'Texto'],
    ],
  },
  {
    group: 'Musgo', note: 'Cor de ação e da marca',
    colors: [['moss-100', '#e0e8d0', 'Realce'], ['moss-300', '#a7b882', 'Anel de foco'], ['moss-500', '#5b6b34', 'Ícones'], ['moss-700', '#3c4a22', 'Botão principal']],
  },
  {
    group: 'Acentos da jornada', note: 'Uma cor por etapa do espaço',
    colors: [['terracotta-500', '#b5452b', 'Reportado'], ['ochre-500', '#c08a2e', 'Com proposta'], ['river-500', '#3f6e8c', 'Em obra'], ['moss-500', '#5b6b34', 'Adotado']],
  },
]

function Section({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-line pt-10">
      <div>
        <p className="text-[12px] font-semibold tracking-wider text-moss-500 uppercase">{kicker}</p>
        <h2 className="text-[28px] leading-tight font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Swatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-line bg-surface">
      <div className="h-16 border-b border-line" style={{ background: hex }} />
      <div className="px-3 py-2">
        <p className="text-[13px] font-semibold">{use}</p>
        <p className="font-mono text-[12px] text-ink-500">{name} · {hex}</p>
      </div>
    </div>
  )
}

// Foto de exemplo: gradiente com a cor da etapa (sem depender de imagens externas)
function PhotoStub({ status, className }: { status: SpaceStatus; className?: string }) {
  const bg = { reportado: '#d9b7a8', com_proposta: '#e3cf9f', em_obra: '#b6cad6', adotado: '#b9c99a' }[status]
  return (
    <div className={cn('flex items-center justify-center text-ink-900/30', className)} style={{ background: `linear-gradient(135deg, ${bg}, #f3eee2)` }}>
      <CameraIcon className="size-7" />
    </div>
  )
}

function SpaceCard({ name, type, status, reports }: { name: string; type: string; status: SpaceStatus; reports: number }) {
  return (
    <Card padding="none" interactive className="overflow-hidden">
      <PhotoStub status={status} className="aspect-[16/9]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold tracking-wider text-ink-500 uppercase">{type}</span>
          <StatusBadge status={status} />
        </div>
        <h3 className="text-lg leading-snug font-semibold">{name}</h3>
        <p className="flex items-center gap-1 text-[13px] text-ink-500"><PinIcon className="size-4" /> Boa Vista, Recife · {reports} reportes</p>
      </div>
    </Card>
  )
}

// Mapa ilustrativo (ruas e quadras em SVG) para mostrar a tela principal sem depender de tiles
function FakeMap() {
  const dots: [number, number, SpaceStatus][] = [[22, 30, 'reportado'], [62, 22, 'com_proposta'], [40, 55, 'em_obra'], [75, 60, 'adotado'], [30, 78, 'reportado']]
  const color = { terracotta: '#b5452b', ochre: '#c08a2e', river: '#3f6e8c', moss: '#5b6b34', neutral: '#6b6052' }
  return (
    <div className="absolute inset-0 bg-[#ece6d6]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d="M0 40 Q40 35 100 45" stroke="#fff" strokeWidth="2.2" fill="none" />
        <path d="M30 0 Q35 50 25 100" stroke="#fff" strokeWidth="2.2" fill="none" />
        <path d="M0 70 L100 82" stroke="#fff" strokeWidth="1.4" fill="none" />
        <path d="M70 0 L60 100" stroke="#fff" strokeWidth="1.4" fill="none" />
        <path d="M80 0 Q90 40 100 30 L100 0z" fill="#cfe0d8" />
        <rect x="44" y="60" width="12" height="10" rx="1" fill="#d6e0c2" />
      </svg>
      {dots.map(([x, y, s], i) => (
        <span key={i} className="absolute size-4 -translate-1/2 rounded-full border-[3px] border-white shadow-raised" style={{ left: `${x}%`, top: `${y}%`, background: color[statusTone[s]] }} />
      ))}
    </div>
  )
}

function PhoneMock() {
  return (
    <div className="mx-auto w-[300px] shrink-0 rounded-[36px] border-[10px] border-ink-900 bg-ink-900 shadow-overlay">
      <div className="relative h-[600px] overflow-hidden rounded-[26px] bg-paper">
        <FakeMap />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-paper/95 px-4 py-3 shadow-card backdrop-blur">
          <Logo className="[&_span:last-child]:text-[22px]" />
          <span className="flex size-9 items-center justify-center rounded-full bg-moss-100 text-sm font-semibold text-moss-800">AM</span>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="rounded-t-xl border border-line bg-surface px-4 pt-2 pb-4 shadow-overlay">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" />
            <p className="text-[11px] font-semibold tracking-wider text-ink-500 uppercase">Praça · público</p>
            <h3 className="mb-2 text-lg leading-tight font-semibold">Praça Maciel Pinheiro</h3>
            <StatusSteps status="com_proposta" />
            <Button block size="md" className="mt-4">Quero adotar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Demo() {
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="ds min-h-dvh">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 sm:px-8 sm:py-12">
        {/* Abertura */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-1 flex-col gap-4">
            <Logo />
            <h1 className="text-[40px] leading-[1.05] font-semibold sm:text-[52px]">
              Cuidar do entorno é <em className="font-medium text-moss-700">ofício</em>, não caridade.
            </h1>
            <p className="max-w-prose text-[17px] leading-relaxed text-ink-700">
              Direção visual <strong>híbrida</strong>: a estrutura de um serviço cívico (legível, alto contraste, feita para o celular)
              com a alma de uma guilda de artesãos, nos títulos serifados, na paleta de terra e musgo e nos ornamentos usados só em momentos especiais.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="moss">Fraunces + Public Sans</Badge>
              <Badge tone="ochre">Contraste AA</Badge>
              <Badge tone="river">Mobile first</Badge>
            </div>
          </div>
          <PhoneMock />
        </header>

        <Section kicker="Tokens" title="Cores">
          {palette.map((p) => (
            <div key={p.group} className="flex flex-col gap-3">
              <p className="text-[15px]"><strong>{p.group}</strong> <span className="text-ink-500">· {p.note}</span></p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {p.colors.map(([n, h, u]) => <Swatch key={n + u} name={n} hex={h} use={u} />)}
              </div>
            </div>
          ))}
        </Section>

        <Section kicker="Tokens" title="Tipografia">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-3">
              <p className="text-[12px] font-semibold tracking-wider text-ink-500 uppercase">Fraunces · títulos</p>
              <p className="font-display text-[40px] leading-none font-semibold">Praça do Sol</p>
              <p className="font-display text-[28px] leading-tight font-semibold">Proposta de revitalização</p>
              <p className="font-display text-[22px] leading-tight font-semibold">Diário da obra</p>
              <p className="font-display text-lg italic text-ink-700">“Adotado pela Padaria Boa Vista desde 2026”</p>
            </Card>
            <Card className="flex flex-col gap-3">
              <p className="text-[12px] font-semibold tracking-wider text-ink-500 uppercase">Public Sans · interface e leitura</p>
              <p className="text-[17px] leading-relaxed">Texto corrido em 17px no celular. Public Sans foi desenhada para serviços públicos: números claros, ótima em telas pequenas.</p>
              <p className="text-[15px] text-ink-700">Interface, rótulos e botões em 15px.</p>
              <p className="text-[13px] text-ink-500">Metadados e dicas em 13px · 12 nov 2026</p>
              <p className="text-[12px] font-semibold tracking-wider text-ink-500 uppercase">Sobretítulo em caixa alta</p>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Raio sm', 'rounded-sm'], ['Raio md', 'rounded-md'], ['Raio lg', 'rounded-lg'], ['Raio xl', 'rounded-xl']].map(([l, c]) => (
              <div key={l} className={cn('flex h-20 items-end border border-line bg-surface p-3 text-[13px] shadow-card', c)}>{l}</div>
            ))}
          </div>
        </Section>

        <Section kicker="Componentes" title="Botões">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Enviar reporte</Button>
            <Button variant="secondary">Ver proposta</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Remover</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" icon={<PlusIcon />}>Reportar espaço</Button>
            <Button size="sm" variant="secondary">Pequeno</Button>
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500) }}>
              {loading ? 'Enviando...' : 'Clique para carregar'}
            </Button>
            <Button disabled>Desabilitado</Button>
          </div>
          <p className="text-[13px] text-ink-500">Use Tab para ver o anel de foco. Botões padrão têm 44px de altura para o toque.</p>
        </Section>

        <Section kicker="Componentes" title="Formulários">
          <div className="grid items-start gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-4">
              <Segmented label="Acesso" value={mode} onChange={setMode} options={[{ value: 'login', label: 'Entrar' }, { value: 'cadastro', label: 'Criar conta' }]} />
              {mode === 'cadastro' && <Field label="Nome"><Input placeholder="Como quer ser chamado" /></Field>}
              <Field label="Email"><Input type="email" placeholder="voce@email.com" /></Field>
              <Field label="Senha" hint={mode === 'cadastro' ? 'Mínimo de 8 caracteres' : undefined}><Input type="password" /></Field>
              {mode === 'cadastro' && (
                <Field label="Como você quer participar?">
                  <Select defaultValue="morador">
                    <option value="morador">Sou morador</option>
                    <option value="adotante">Quero adotar um espaço</option>
                    <option value="prestador">Sou prestador de serviço</option>
                  </Select>
                </Field>
              )}
              <Button block>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
            </Card>
            <Card className="flex flex-col gap-4">
              <Field label="Nome do espaço" error="O nome precisa ter pelo menos 3 caracteres"><Input defaultValue="Pç" /></Field>
              <Field label="O que está acontecendo?" hint="Lixo, mato alto, pichação, bancos quebrados..."><Textarea rows={3} /></Field>
              <Field label="Ponto de referência" optional><Input disabled placeholder="Campo desabilitado" /></Field>
              <Checkbox label="É um espaço público" description="Praças, canteiros e muros da prefeitura" defaultChecked />
              <Callout tone="info">Toque no mapa para marcar onde fica o espaço.</Callout>
              <Callout tone="error">Não foi possível enviar. Verifique sua conexão.</Callout>
            </Card>
          </div>
        </Section>

        <Section kicker="Componentes" title="Status da jornada">
          <div className="flex flex-wrap gap-2">{statuses.map((s) => <StatusBadge key={s} status={s} />)}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {statuses.map((s) => <Card key={s} padding="sm"><StatusSteps status={s} /></Card>)}
          </div>
        </Section>

        <Section kicker="Componentes" title="Cartões de espaço">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SpaceCard name="Praça Maciel Pinheiro" type="Praça" status="com_proposta" reports={7} />
            <SpaceCard name="Muro da Rua da Aurora" type="Muro" status="reportado" reports={3} />
            <SpaceCard name="Canteiro da Av. Conde da Boa Vista" type="Canteiro" status="em_obra" reports={12} />
          </div>
        </Section>

        <Section kicker="Componentes" title="Painel, modal e avisos">
          <div className="grid items-start gap-6 md:grid-cols-[384px_1fr]">
            <Panel
              eyebrow="Jardim · público"
              title="Jardim do Derby"
              onClose={() => toast('Fecharia o painel', 'info')}
              className="max-h-[560px]"
              footer={<Button block variant="secondary" onClick={() => toast('Abriria o diário da obra', 'info')}>Ver diário da obra</Button>}
            >
              <div className="flex flex-col gap-5">
                <StatusSteps status="adotado" />
                <Card padding="sm" className="flex flex-col gap-3 border-ochre-500/40 bg-ochre-100/40 text-center shadow-none">
                  <Ornament />
                  <p className="font-display text-lg leading-snug">Adotado pela <strong>Associação de Moradores do Derby</strong></p>
                  <p className="text-[13px] text-ink-500">Placa entalhada por Seu Antônio, marceneiro do bairro</p>
                </Card>
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-semibold">3 reportes</h3>
                  {[['Ana Lima', 'Mato alto e bancos quebrados perto do coreto.'], ['João Melo', 'Lixo acumulado na entrada da Rua do Futuro.']].map(([n, d]) => (
                    <div key={n} className="border-l-2 border-line pl-3">
                      <p className="text-[15px] leading-relaxed">{d}</p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <PhotoStub status="reportado" className="aspect-square rounded-sm" />
                        <PhotoStub status="adotado" className="aspect-square rounded-sm" />
                      </div>
                      <p className="mt-1.5 text-[13px] text-ink-500">{n} · 2 nov 2026</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Card className="flex flex-col gap-4">
              <p className="text-[15px] text-ink-700">
                O <strong>painel</strong> ao lado é como a página do espaço aparece sobre o mapa: folha que sobe de baixo no celular, coluna à direita no computador.
                O selo com ornamento aparece só quando o espaço é adotado.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setModal(true)}>Abrir modal</Button>
                <Button variant="secondary" onClick={() => toast('Reporte enviado. Obrigado por cuidar da cidade!')}>Aviso de sucesso</Button>
                <Button variant="secondary" onClick={() => toast('A imagem pode ter no máximo 5 MB', 'error')}>Aviso de erro</Button>
              </div>
            </Card>
          </div>
        </Section>

        <footer className="flex flex-col items-center gap-3 border-t border-line pt-8 pb-4 text-center">
          <Ornament className="w-48" />
          <p className="text-[13px] text-ink-500">Mester · design system v0.1 · proposta para aprovação</p>
        </footer>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Manifestar interesse"
        footer={<>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button onClick={() => { setModal(false); toast('Interesse registrado!') }}>Confirmar</Button>
        </>}
      >
        <p className="text-[15px] leading-relaxed text-ink-700">
          A equipe do Mester prepara uma proposta de revitalização com orçamento e te envia em até 5 dias úteis. Nada é cobrado agora.
        </p>
      </Modal>
    </div>
  )
}

export function Showcase() {
  return <ToastProvider><Demo /></ToastProvider>
}
