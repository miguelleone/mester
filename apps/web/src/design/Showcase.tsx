import { useState, type CSSProperties, type ReactNode } from 'react'
import { statusLabel, type SpaceStatus } from '../api'
import {
  Arrow, Button, Checkbox, Field, Hand, Highlight, Input, Logo, Mark, Modal, Note, Panel, Select, Sheet, Snapshot,
  StatusMark, StatusSteps, Tabs, Tag, Tape, Textarea, ToastProvider, useToast, cn,
} from '../components/ui/index'

const statuses = Object.keys(statusLabel) as SpaceStatus[]

/* ---------- peças do showcase ---------- */

// Cabeçalho de seção datilografado, com o número da folha à direita (como num roteiro)
function Section({ title, sheet, children, className }: { title: string; sheet: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-8', className)}>
      <div className="flex items-baseline justify-between border-b border-type-900 pb-1">
        <h2 className="text-[15px] tracking-[0.14em] uppercase">{title}</h2>
        <span className="text-[13px] text-type-600">{sheet}</span>
      </div>
      {children}
    </section>
  )
}

// Recorte de cor chapada, como os pedaços de papel colados na referência
function Swatch({ hex, name, use, tilt, note, pen = 'blue' }: { hex: string; name: string; use: string; tilt: number; note?: string; pen?: 'blue' | 'red' | 'green' }) {
  return (
    <div className="flex flex-col gap-2">
      <Sheet tilt={tilt} padding="none" className="overflow-hidden">
        <div className="h-20 border-b border-rule/70" style={{ background: hex }} />
        <div className="px-3 py-2">
          <p className="text-[14px] font-bold">{use}</p>
          <p className="text-[12px] text-type-600">{name} {hex}</p>
        </div>
      </Sheet>
      {note && <Hand pen={pen} tilt={-2} className="pl-2 text-[20px]">{note}</Hand>}
    </div>
  )
}

// Foto de exemplo: bloco de cor chapada com legenda datilografada (sem imagens externas)
function PhotoStub({ tone, label, className }: { tone: string; label?: string; className?: string }) {
  return (
    <div className={cn('flex aspect-[4/3] items-end p-2', className)} style={{ background: tone }}>
      {label && <span className="bg-paper/85 px-1 text-[11px] tracking-[0.08em] uppercase">{label}</span>}
    </div>
  )
}

function SpaceNote({ name, type, status, reports, tilt, photo, className, children }: {
  name: string; type: string; status: SpaceStatus; reports: number; tilt: number; photo: string; className?: string; children?: ReactNode
}) {
  return (
    <div className={cn('relative', className)}>
      <Sheet tilt={tilt} padding="sm" className="flex flex-col gap-3 transition-transform duration-200 hover:rotate-0">
        <Snapshot tilt={-tilt * 1.6} className="relative -mt-6 ml-3 w-[70%]">
          <Tape className="-top-3 left-1/2 w-16 -translate-x-1/2 rotate-3" />
          <PhotoStub tone={photo} label="foto do morador" />
        </Snapshot>
        <div className="flex items-center justify-between gap-2 px-1">
          <Tag>{type}</Tag>
          <StatusMark status={status} />
        </div>
        <h3 className="px-1 text-[19px] leading-snug">{name}</h3>
        <p className="px-1 pb-1 text-[13px] text-type-600">Boa Vista, Recife · {reports} reportes</p>
      </Sheet>
      {children}
    </div>
  )
}

// Mapa ilustrativo em SVG (ruas, rio, praça) para mostrar a tela principal sem depender de tiles
function FakeMap() {
  const pins: [number, number, string][] = [[24, 30, '#c8321e'], [64, 22, '#9a6b12'], [42, 52, '#1f3c9e'], [76, 58, '#2a7340'], [30, 72, '#c8321e']]
  return (
    <div className="absolute inset-0 bg-[#f1f1ef]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d="M78 0 Q92 40 100 32 L100 0z" fill="#dde6f2" />
        <rect x="46" y="60" width="13" height="11" fill="#e1eadb" />
        <path d="M0 40 Q40 35 100 45" stroke="#fff" strokeWidth="2.6" fill="none" />
        <path d="M30 0 Q35 50 25 100" stroke="#fff" strokeWidth="2.6" fill="none" />
        <path d="M0 70 L100 82" stroke="#fff" strokeWidth="1.5" fill="none" />
        <path d="M70 0 L60 100" stroke="#fff" strokeWidth="1.5" fill="none" />
      </svg>
      {pins.map(([x, y, c], i) => (
        <span key={i} className="absolute size-4 -translate-1/2 rounded-full border-[3px] border-white shadow-[0_1px_3px_rgb(0_0_0/0.35)]" style={{ left: `${x}%`, top: `${y}%`, background: c }} />
      ))}
    </div>
  )
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[290px] shrink-0 rotate-[2deg]">
      <Tape className="-top-3 left-8 -rotate-12" />
      <Tape className="-top-2 right-6 rotate-12" />
      <div className="border-[9px] border-type-900 bg-type-900 shadow-lifted">
        <div className="relative h-[560px] overflow-hidden bg-paper">
          <FakeMap />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-type-900 bg-paper px-4 py-3">
            <Logo />
            <span className="text-[12px] font-bold tracking-[0.1em]">ANA M.</span>
          </div>
          {/* anotação solta sobre o mapa */}
          <div className="absolute top-[22%] left-[38%] flex flex-col items-start">
            <Hand pen="red" tilt={-6} className="text-[22px]">tá feio aqui!</Hand>
            <Arrow pen="red" className="-mt-1 -ml-9 w-12 -scale-x-100 rotate-[20deg]" />
          </div>
          <div className="absolute inset-x-2 bottom-2">
            <div className="relative border border-rule bg-paper px-4 pt-5 pb-4 shadow-lifted">
              <Tape className="-top-3 left-1/2 w-16 -translate-x-1/2 rotate-2" />
              <p className="text-[11px] font-bold tracking-[0.12em] text-type-600 uppercase">Praça · pública</p>
              <h3 className="mb-2 text-[18px] leading-tight">Praça Maciel Pinheiro</h3>
              <StatusSteps status="com_proposta" className="text-[12px]" />
              <Button block size="sm" className="mt-4">Quero adotar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const tilt = (deg: number) => ({ '--tilt': `${deg}deg` }) as CSSProperties

/* ---------- página ---------- */

function Demo() {
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="ds min-h-dvh overflow-x-clip">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pt-6 pb-16 sm:px-8 sm:pt-10">

        {/* Linha de topo datilografada, como cabeçalho de roteiro */}
        <div className="flex items-center justify-between gap-4 text-[13px] tracking-[0.08em] uppercase">
          <span>Mester · caderno de campo</span>
          <span className="hidden sm:inline">Recife, novembro de 2026</span>
          <span className="flex items-center gap-3">
            <span>A2</span>
            <Hand pen="red" tilt={-8} className="text-[24px] normal-case">
              <Mark kind="circle" pen="red" width={1.6}>v0.2</Mark>
            </Hand>
          </span>
        </div>

        {/* Abertura */}
        <header className="grid items-start gap-14 md:grid-cols-12 md:gap-8">
          <div className="relative flex flex-col gap-6 md:col-span-7 md:pt-6">
            <Logo tagline className="self-start" />
            <h1 className="text-[34px] leading-[1.1] sm:text-[48px]">
              Espaços da cidade à espera de{' '}
              <Mark kind="circle" pen="red" width={2.4}>cuidado</Mark>.
            </h1>
            <div className="flex max-w-[60ch] flex-col gap-4 text-[16px] leading-[1.7]">
              <p>
                <span className="font-bold">E então,</span> a moradora passa pela praça abandonada, marca o ponto no mapa e
                fotografa o mato alto e os bancos quebrados ....
              </p>
              <p>
                <span className="font-bold">E então,</span> alguém do bairro <Highlight>decide adotar</Highlight>, um jardineiro
                assume a obra e cada etapa vai sendo anotada <span className="line-through decoration-pen-red decoration-2">no relatório</span>{' '}
                <Hand pen="red" tilt={-3} className="text-[22px]">no caderno</Hand> do espaço.
              </p>
            </div>
            {/* nota de margem: à esquerda no desktop largo, entre blocos no celular */}
            <div className="flex items-start gap-2 self-start pl-6 sm:pl-24">
              <Arrow pen="blue" className="mt-1 w-10 shrink-0 -scale-x-100" />
              <Hand pen="blue" tilt={-3}>texto datilografado = o sistema falando</Hand>
            </div>
          </div>

          <div className="relative md:col-span-5">
            <PhoneMock />
            <div className="mt-8 flex items-start justify-center gap-2 md:absolute md:top-[430px] md:-left-44 md:mt-0 md:w-48 md:flex-col md:items-end">
              <Hand pen="green" tilt={3}>o mapa é a página; o espaço é um bilhete colado por cima</Hand>
              <Arrow pen="green" className="hidden w-14 rotate-[20deg] md:block" />
            </div>
          </div>
        </header>

        {/* Princípios em bilhetes soltos */}
        <Section title="Regras do caderno." sheet="A3">
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
            {[
              ['a)', 'Datilografado é o sistema', 'Nomes, dados, botões e textos que o Mester escreve usam máquina de escrever.', -1.4, 'center'],
              ['b)', 'À mão são as pessoas', 'Avisos, erros, ênfases e recados aparecem como anotação de caneta na margem.', 1, 'left'],
              ['c)', 'Módulos soltos', 'Painéis e cartões são folhas coladas por cima, levemente tortas, com fita.', -0.6, 'right'],
            ].map(([n, t, d, deg, tape]) => (
              <Sheet key={n as string} tilt={deg as number} tape={tape as 'left'} className="flex flex-col gap-2">
                <Hand pen="red" tilt={0} className="text-[28px]">{n}</Hand>
                <h3 className="text-[17px]">{t}</h3>
                <p className="text-[14px] leading-relaxed text-type-600">{d}</p>
              </Sheet>
            ))}
          </div>
        </Section>

        <Section title="Tintas." sheet="A4">
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-5">
              <Swatch hex="#ffffff" name="paper" use="Papel" tilt={-1} note="branco, sem bege" />
              <Swatch hex="#141414" name="type-900" use="Tinta da máquina" tilt={1.2} />
              <Swatch hex="#555555" name="type-600" use="Texto secundário" tilt={-0.5} />
              <Swatch hex="#cfdaf0" name="rule-blue" use="Pauta do caderno" tilt={0.8} />
              <Swatch hex="#ff2e7a" name="marker" use="Marca-texto" tilt={-1.6} note="foco e destaque" pen="red" />
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
              <Swatch hex="#c8321e" name="pen-red" use="Caneta vermelha" tilt={1} note="problema / reportado" pen="red" />
              <Swatch hex="#9a6b12" name="pen-ochre" use="Caneta ocre" tilt={-1.2} note="tem proposta" />
              <Swatch hex="#1f3c9e" name="pen-blue" use="Caneta azul" tilt={0.6} note="em obra / recados" />
              <Swatch hex="#2a7340" name="pen-green" use="Caneta verde" tilt={-0.8} note="adotado, cuidado" pen="green" />
            </div>
          </div>
        </Section>

        <Section title="Letras." sheet="A5">
          <div className="grid items-start gap-10 md:grid-cols-12 md:gap-6">
            <Sheet tilt={-0.8} tape="left" className="flex flex-col gap-4 md:col-span-7">
              <p className="text-[12px] tracking-[0.12em] text-type-600 uppercase">Courier Prime · o sistema</p>
              <p className="text-[40px] leading-none font-bold">Praça do Sol</p>
              <p className="text-[24px] leading-tight font-bold">Proposta de revitalização</p>
              <p className="max-w-[52ch] text-[16px] leading-[1.7]">
                Texto corrido em 16px com entrelinha generosa. Feita para roteiros, a Courier Prime lê bem em tela pequena e dá o tom de documento de trabalho.
              </p>
              <p className="text-[13px] tracking-[0.12em] uppercase">Rótulo · 13px · caixa alta</p>
            </Sheet>
            <div className="flex flex-col gap-6 md:col-span-5 md:pt-10">
              <Sheet tilt={1.4} paper="ruled" className="flex flex-col gap-1">
                <p className="text-[12px] tracking-[0.12em] text-type-600 uppercase">Caveat · as pessoas</p>
                <Hand pen="blue" tilt={-1} className="text-[34px]">Também passo aqui todo dia!</Hand>
                <Hand pen="red" tilt={1} className="text-[26px]">mínimo de 3 letras</Hand>
                <Hand pen="green" tilt={-2} className="text-[26px]">adotado pela padaria ✓</Hand>
              </Sheet>
              <Hand pen="red" tilt={-2} className="self-end pr-4">
                letra de mão nunca em texto longo, só recados curtos
              </Hand>
            </div>
          </div>
        </Section>

        <Section title="Botões." sheet="A6">
          <Sheet paper="grid" className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Enviar reporte</Button>
              <Button variant="secondary">Ver proposta</Button>
              <Button variant="ghost">Cancelar</Button>
              <Button variant="danger">Remover</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg">+ Reportar espaço</Button>
              <Button size="sm" variant="secondary">Pequeno</Button>
              <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1600) }}>
                {loading ? 'Enviando' : 'Clique p/ carregar'}
              </Button>
              <Button disabled>Desabilitado</Button>
            </div>
            <div className="flex items-start gap-2">
              <Arrow pen="red" className="w-10 shrink-0 -scale-y-100 rotate-[-30deg]" />
              <Hand pen="red" tilt={-1}>passe o mouse: o botão levanta e deixa rastro de marca-texto. Tab mostra o foco rosa.</Hand>
            </div>
          </Sheet>
        </Section>

        <Section title="Formulários." sheet="A7">
          <div className="grid items-start gap-12 md:grid-cols-12 md:gap-0">
            <Sheet tilt={-1.2} tape="center" lifted className="flex flex-col gap-5 md:col-span-5 md:z-10">
              <Tabs label="Acesso" value={mode} onChange={setMode} options={[{ value: 'login', label: 'Entrar' }, { value: 'cadastro', label: 'Criar conta' }]} />
              {mode === 'cadastro' && <Field label="Nome"><Input placeholder="como quer ser chamado" /></Field>}
              <Field label="Email"><Input type="email" placeholder="voce@email.com" /></Field>
              <Field label="Senha" hint={mode === 'cadastro' ? 'mínimo de 8 caracteres' : undefined}><Input type="password" /></Field>
              {mode === 'cadastro' && (
                <Field label="Você é">
                  <Select defaultValue="morador">
                    <option value="morador">morador</option>
                    <option value="adotante">quem quer adotar um espaço</option>
                    <option value="prestador">prestador de serviço</option>
                  </Select>
                </Field>
              )}
              <Button block>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
            </Sheet>
            <Sheet tilt={0.8} className="flex flex-col gap-5 md:col-span-7 md:-ml-6 md:mt-14">
              <h3 className="text-[20px]">Reportar um espaço</h3>
              <Note tone="info">toque no mapa pra marcar onde fica</Note>
              <Field label="Nome do espaço" error="mínimo de 3 letras"><Input defaultValue="Pç" /></Field>
              <Field label="O que está acontecendo?" hint="lixo, mato alto, pichação, bancos quebrados..."><Textarea rows={4} defaultValue="Mato alto perto do coreto e dois bancos quebrados." /></Field>
              <Field label="Ponto de referência" optional><Input disabled placeholder="campo desabilitado" /></Field>
              <Checkbox label="É um espaço público" description="praças, canteiros e muros da prefeitura" defaultChecked />
              <Note tone="error">não deu pra enviar. confere a conexão?</Note>
              <div className="flex flex-wrap gap-3"><Button>Enviar reporte</Button><Button variant="ghost">Cancelar</Button></div>
            </Sheet>
          </div>
        </Section>

        <Section title="A jornada de um espaço." sheet="A8">
          <div className="grid items-start gap-10 md:grid-cols-12 md:gap-6">
            <Sheet tilt={-0.6} className="flex flex-col gap-5 md:col-span-7">
              {statuses.map((s) => <StatusSteps key={s} status={s} />)}
            </Sheet>
            <div className="flex flex-col gap-4 md:col-span-5 md:pt-6">
              <div className="flex flex-wrap gap-3">{statuses.map((s) => <StatusMark key={s} status={s} />)}</div>
              <Hand pen="blue" tilt={-1.5}>cada etapa tem a sua caneta. no mapa, o pino usa a mesma cor.</Hand>
            </div>
          </div>
        </Section>

        <Section title="Espaços." sheet="A9">
          <div className="grid gap-14 pt-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <SpaceNote name="Praça Maciel Pinheiro" type="Praça" status="com_proposta" reports={7} tilt={-1.2} photo="#b89a52" />
            <SpaceNote name="Muro da Rua da Aurora" type="Muro" status="reportado" reports={3} tilt={1} photo="#9aa3a8" className="lg:mt-12">
              <Hand pen="red" tilt={-5} className="absolute -top-8 right-0 text-[22px]">urgente!</Hand>
            </SpaceNote>
            <SpaceNote name="Canteiro da Av. Conde da Boa Vista" type="Canteiro" status="em_obra" reports={12} tilt={-0.4} photo="#7f9273" />
          </div>
        </Section>

        <Section title="Painel, modal e avisos." sheet="A10">
          <div className="grid items-start gap-12 md:grid-cols-12 md:gap-8">
            <Panel
              eyebrow="Jardim · público"
              title="Jardim do Derby"
              onClose={() => toast('fecharia o painel', 'info')}
              className="max-h-[600px] md:col-span-5"
              footer={<Button block variant="secondary" onClick={() => toast('abriria o diário da obra', 'info')}>Ver diário da obra</Button>}
            >
              <div className="flex flex-col gap-6">
                <StatusSteps status="adotado" />
                <div className="relative border-2 border-pen-green px-4 py-3">
                  <p className="text-[15px]">Adotado pela <span className="font-bold">Associação de Moradores do Derby</span>.</p>
                  <Hand pen="green" tilt={-2} className="mt-1 text-[20px]">placa entalhada pelo Seu Antônio, marceneiro do bairro</Hand>
                </div>
                <div className="flex flex-col gap-5">
                  <h3 className="text-[15px] tracking-[0.1em] uppercase">3 reportes</h3>
                  {[['Ana Lima', 'Mato alto e bancos quebrados perto do coreto.', '#b89a52'], ['João Melo', 'Lixo acumulado na entrada da Rua do Futuro.', '#9aa3a8']].map(([n, d, c], i) => (
                    <div key={n} className="flex flex-col gap-2 border-l border-type-400 pl-3">
                      <p className="text-[15px] leading-relaxed">{d}</p>
                      <div className="flex gap-2">
                        <Snapshot tilt={i ? 2 : -2} className="w-20"><PhotoStub tone={c} /></Snapshot>
                        <Snapshot tilt={i ? -1 : 1.5} className="w-20"><PhotoStub tone="#7f9273" /></Snapshot>
                      </div>
                      <p className="text-[13px] text-type-600">{n} · 2 nov 2026</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <div className="flex flex-col gap-8 md:col-span-7 md:pt-8">
              <Sheet tilt={0.6} className="flex flex-col gap-5">
                <p className="text-[15px] leading-relaxed">
                  O painel ao lado é a página do espaço colada sobre o mapa: sobe de baixo no celular e fica solto à direita no computador.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => setModal(true)}>Abrir modal</Button>
                  <Button variant="secondary" onClick={() => toast('reporte enviado. obrigado por cuidar da cidade.')}>Aviso ok</Button>
                  <Button variant="secondary" onClick={() => toast('a imagem pode ter no máximo 5 MB', 'error')}>Aviso de erro</Button>
                </div>
              </Sheet>
              <div className="flex items-start gap-2 pl-4" style={tilt(0)}>
                <Arrow pen="red" className="w-12 shrink-0 -scale-x-100" />
                <Hand pen="red" tilt={-2}>os avisos chegam como tira de papel no rodapé, com a palavra à mão</Hand>
              </div>
            </div>
          </div>
        </Section>

        <footer className="flex flex-col items-center gap-2 pt-4 text-center">
          <p className="text-[13px] tracking-[0.12em] uppercase">— fim da folha A10 —</p>
          <Hand pen="blue" tilt={-3} className="text-[24px]">risca, anota e me devolve!</Hand>
        </footer>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Quero adotar este espaço"
        footer={<>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button onClick={() => { setModal(false); toast('interesse registrado!') }}>Confirmar</Button>
        </>}
      >
        <p className="text-[15px] leading-relaxed">
          A equipe do Mester prepara uma proposta de revitalização com orçamento e te envia em até 5 dias úteis.
        </p>
        <Hand pen="blue" tilt={-2} className="mt-3">nada é cobrado agora</Hand>
      </Modal>
    </div>
  )
}

export function Showcase() {
  return <ToastProvider><Demo /></ToastProvider>
}
