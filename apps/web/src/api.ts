export type Space = {
  id: string
  name: string
  type: 'praca' | 'muro' | 'canteiro' | 'fachada' | 'jardim'
  status: 'reportado' | 'com_proposta' | 'em_obra' | 'adotado'
  lat: number
  lng: number
}

export async function fetchSpaces(): Promise<Space[]> {
  const res = await fetch('/api/spaces')
  if (!res.ok) throw new Error('Falha ao carregar espaços')
  return res.json()
}
