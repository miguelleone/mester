import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth, type RegisterInput } from '../auth'
import { Button, Field, Input, Modal, Select, cn, useToast } from './ui'

const roleLabel = {
  morador: 'Morador',
  adotante: 'Adotante',
  prestador: 'Prestador',
  gestor: 'Gestor da prefeitura',
  admin: 'Admin',
} as const

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// Entrar e criar conta numa janela; logado, vira um menu com nome, papel e sair
export function AuthPanel({ open, onOpenChange }: Props) {
  const { user, login, register, logout } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <UserMenu name={user.name} role={roleLabel[user.role]} onLogout={() => { logout(); toast('você saiu da conta', 'info') }} />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') await login(email, password)
      else await register({ name: String(f.get('name')), email, password, role: f.get('role') as RegisterInput['role'] })
      onOpenChange(false)
      toast(mode === 'login' ? 'você entrou' : 'conta criada, bem-vindo')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const cadastro = mode === 'cadastro'

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => onOpenChange(true)}>entrar</Button>
      <Modal
        open={open}
        onClose={() => onOpenChange(false)}
        title={cadastro ? 'Criar conta' : 'Entrar'}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>cancelar</Button>
            <Button type="submit" form="auth-form" loading={busy}>{cadastro ? 'criar conta' : 'entrar'}</Button>
          </>
        }
      >
        <div className="mb-4 inline-flex rounded-full bg-paper-2 p-0.5 font-mono text-[12px]">
          {(['login', 'cadastro'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => { setMode(m); setError(null) }}
              className={cn('h-7 rounded-full px-3 transition-colors', mode === m ? 'bg-ink-1 text-paper' : 'text-ink-2 hover:bg-hl')}
            >
              {m === 'login' ? 'já tenho conta' : 'sou novo aqui'}
            </button>
          ))}
        </div>
        <form id="auth-form" key={mode} onSubmit={onSubmit} className="flex flex-col gap-3">
          {cadastro && (
            <Field label="nome">
              <Input name="name" required minLength={2} autoComplete="name" />
            </Field>
          )}
          <Field label="email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="senha" hint={cadastro ? 'Pelo menos 8 caracteres.' : undefined}>
            <Input name="password" type="password" required minLength={cadastro ? 8 : 1} autoComplete={cadastro ? 'new-password' : 'current-password'} />
          </Field>
          {cadastro && (
            <Field label="você é">
              <Select name="role" defaultValue="morador">
                <option value="morador">Morador, quero reportar</option>
                <option value="adotante">Quero adotar um espaço</option>
                <option value="prestador">Prestador de serviço</option>
              </Select>
            </Field>
          )}
          {error && <p role="alert" className="text-[15px] text-alert"><span className="font-mono text-[12px] font-bold">! </span>{error}</p>}
        </form>
      </Modal>
    </>
  )
}

function UserMenu({ name, role, onLogout }: { name: string; role: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora ou com Esc
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('pointerdown', onDown)
    addEventListener('keydown', onKey)
    return () => { removeEventListener('pointerdown', onDown); removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <Button size="sm" variant="secondary" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="max-w-[12ch] truncate">{name.split(' ')[0]}</span>
        <span aria-hidden className="ml-1 text-[10px]">▾</span>
      </Button>
      {open && (
        <div className="absolute top-9 right-0 z-50 flex w-60 animate-rise flex-col gap-2 rounded-lg bg-paper p-4 shadow-float">
          <div>
            <p className="font-display text-[22px] leading-tight">{name}</p>
            <p className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">{role}</p>
          </div>
          <Button variant="link" className="self-start" onClick={onLogout}>sair da conta</Button>
        </div>
      )}
    </div>
  )
}
