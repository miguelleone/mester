import { useState, type FormEvent } from 'react'
import { useAuth, type RegisterInput } from '../auth'

const roleLabel = {
  morador: 'Morador',
  adotante: 'Adotante',
  prestador: 'Prestador',
  gestor: 'Gestor da prefeitura',
  admin: 'Admin',
} as const

const input = 'w-full rounded border border-ink/30 bg-white/70 px-2 py-1.5 text-sm'

export function AuthPanel() {
  const { user, login, register, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span>{user.name} · <span className="opacity-70">{roleLabel[user.role]}</span></span>
        <button className="underline" onClick={logout}>Sair</button>
      </div>
    )
  }

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
      setOpen(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <button className="rounded bg-moss px-3 py-1.5 text-sm text-parchment" onClick={() => setOpen(!open)}>
        Entrar
      </button>
      {open && (
        <form
          onSubmit={onSubmit}
          className="absolute right-0 z-[1000] mt-2 flex w-72 flex-col gap-2 rounded border border-ink/20 bg-parchment p-4 shadow-lg"
        >
          <div className="mb-1 flex gap-4 text-sm">
            {(['login', 'cadastro'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null) }}
                className={mode === m ? 'font-semibold underline' : 'opacity-60'}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
          {mode === 'cadastro' && <input name="name" placeholder="Nome" required minLength={2} className={input} />}
          <input name="email" type="email" placeholder="Email" required className={input} />
          <input name="password" type="password" placeholder="Senha" required minLength={mode === 'cadastro' ? 8 : 1} className={input} />
          {mode === 'cadastro' && (
            <select name="role" defaultValue="morador" className={input}>
              <option value="morador">Sou morador</option>
              <option value="adotante">Quero adotar um espaço</option>
              <option value="prestador">Sou prestador de serviço</option>
            </select>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="rounded bg-moss px-3 py-1.5 text-sm text-parchment disabled:opacity-50">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      )}
    </div>
  )
}
