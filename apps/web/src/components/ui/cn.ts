// Junta classes ignorando valores falsos
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
