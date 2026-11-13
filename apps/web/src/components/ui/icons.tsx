// Ícones de traço simples, herdam a cor do texto
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export const CloseIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const PlusIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 5v14M5 12h14" /></svg>
)
export const PinIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const CameraIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
)
export const CheckIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const AlertIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
)
export const InfoIcon = ({ className = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5h.01" /></svg>
)
export const ChevronDown = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 9l6 6 6-6" /></svg>
)
