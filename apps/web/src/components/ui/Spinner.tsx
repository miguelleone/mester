import { useEffect, useState } from 'react'

const frames = ['|', '/', '-', '\\']

// Spinner de terminal: | / - \
export function Spinner({ className }: { className?: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % frames.length), 120)
    return () => clearInterval(t)
  }, [])
  return <span aria-hidden className={className}>{frames[i]}</span>
}

// Cursor piscando, para estados "aguardando"
export function Cursor({ className }: { className?: string }) {
  return <span aria-hidden className={`animate-blink ${className ?? ''}`}>▍</span>
}
