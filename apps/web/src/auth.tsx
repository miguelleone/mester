import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Role = 'morador' | 'adotante' | 'prestador' | 'gestor' | 'admin'
export type User = { id: string; name: string; email: string; role: Role }
export type RegisterInput = {
  name: string
  email: string
  password: string
  role: 'morador' | 'adotante' | 'prestador'
}

type AuthState = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'mester.token'
const AuthContext = createContext<AuthState | null>(null)

function readToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* sem storage: sessão só em memória */ }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? 'Algo deu errado')
  return data as T
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken)
  const [user, setUser] = useState<User | null>(null)

  // Recupera o usuário do token salvo; token inválido ou expirado encerra a sessão
  useEffect(() => {
    if (!token) { setUser(null); return }
    fetch('/api/auth/me', { headers: { authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => { writeToken(null); setToken(null) })
  }, [token])

  function startSession(s: { token: string; user: User }) {
    writeToken(s.token)
    setToken(s.token)
    setUser(s.user)
  }

  const value: AuthState = {
    user,
    token,
    login: async (email, password) => startSession(await post('/auth/login', { email, password })),
    register: async (input) => startSession(await post('/auth/register', input)),
    logout: () => { writeToken(null); setToken(null) },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
