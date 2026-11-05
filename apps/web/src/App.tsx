import { useEffect, useState } from 'react'
import { fetchSpaces, type Space } from './api'
import { SpacesMap } from './components/SpacesMap'

export default function App() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpaces().then(setSpaces).catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-ink/20 px-4 py-3">
        <h1 className="font-serif text-2xl tracking-wide">Mester</h1>
        <p className="text-sm opacity-70">Espaços da cidade à espera de cuidado</p>
      </header>
      {error && <p className="px-4 py-2 text-sm text-red-700">{error}</p>}
      <main className="flex-1">
        <SpacesMap spaces={spaces} />
      </main>
    </div>
  )
}
