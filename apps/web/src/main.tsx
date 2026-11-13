import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './auth'
// O showcase do design system é carregado à parte, só quando aberto
const Showcase = lazy(() => import('./design/Showcase').then((m) => ({ default: m.Showcase })))

// #/design abre o showcase do design system
function Root() {
  const [design, setDesign] = useState(location.hash === '#/design')
  useEffect(() => {
    const on = () => setDesign(location.hash === '#/design')
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return design ? <Suspense><Showcase /></Suspense> : <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
