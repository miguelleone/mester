export type SpaceType = 'praca' | 'muro' | 'canteiro' | 'fachada' | 'jardim'
export type SpaceStatus = 'reportado' | 'com_proposta' | 'em_obra' | 'adotado'

export type Space = {
  id: string
  name: string
  type: SpaceType
  status: SpaceStatus
  lat: number
  lng: number
}

export type Report = {
  id: string
  description: string
  photos: string[]
  author: { id: string; name: string }
  createdAt: string
}

export type SpaceDetail = Space & {
  isPublic: boolean
  createdAt: string
  reports: Report[]
}

export type NewSpace = {
  name: string
  type: SpaceType
  isPublic: boolean
  lat: number
  lng: number
  description: string
  photos: string[]
}

export const spaceTypeLabel: Record<SpaceType, string> = {
  praca: 'Praça',
  muro: 'Muro',
  canteiro: 'Canteiro',
  fachada: 'Fachada',
  jardim: 'Jardim',
}

export const statusLabel: Record<SpaceStatus, string> = {
  reportado: 'Reportado',
  com_proposta: 'Com proposta',
  em_obra: 'Em obra',
  adotado: 'Adotado',
}

export const statusColor: Record<SpaceStatus, string> = {
  reportado: '#b5452b',
  com_proposta: '#c08a2e',
  em_obra: '#3f6e8c',
  adotado: '#4f5d2f',
}

async function request<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token, ...rest } = init
  const headers: Record<string, string> = {}
  if (rest.body) headers['content-type'] = 'application/json'
  if (token) headers.authorization = `Bearer ${token}`
  const res = await fetch(`/api${path}`, { ...rest, headers })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) throw new Error('Sua sessão expirou. Entre de novo.')
  if (!res.ok) throw new Error(data.message ?? 'Algo deu errado')
  return data as T
}

export const fetchSpaces = () => request<Space[]>('/spaces')

export const fetchSpace = (id: string) => request<SpaceDetail>(`/spaces/${id}`)

export const createSpace = (token: string, input: NewSpace) =>
  request<SpaceDetail>('/spaces', { method: 'POST', token, body: JSON.stringify(input) })

export const addReport = (token: string, id: string, description: string, photos: string[]) =>
  request<SpaceDetail>(`/spaces/${id}/reports`, { method: 'POST', token, body: JSON.stringify({ description, photos }) })

// A API devolve caminhos como /uploads/x.jpg; o front fala com ela pelo proxy /api
export const photoUrl = (path: string) => `/api${path}`

export async function uploadPhoto(token: string, file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/uploads', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body })
  const data = await res.json().catch(() => ({}))
  if (res.status === 413) throw new Error('A imagem pode ter no máximo 5 MB')
  if (!res.ok) throw new Error(data.message ?? 'Falha ao enviar a foto')
  return data.url
}

export const updateStatus = (token: string, id: string, status: SpaceStatus) =>
  request<SpaceDetail>(`/spaces/${id}/status`, { method: 'PATCH', token, body: JSON.stringify({ status }) })
