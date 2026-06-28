// Helper para formatear números (ej: 45200 -> 45.2K)
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

// Formatear tiempo relativo en español
export function timeAgo(date: string | Date | number | null | undefined): string {
  if (date == null) return 'ahora'
  let d: Date
  if (typeof date === 'number') d = new Date(date)
  else if (typeof date === 'string') d = new Date(date)
  else d = date
  if (isNaN(d.getTime())) return 'ahora'
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} d`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `hace ${weeks} sem`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} mes`
  return `hace ${Math.floor(days / 365)} año`
}

// Colores de rareza
export const rarityStyles: Record<string, { label: string; color: string; glow: string }> = {
  common: { label: 'Común', color: '#94a3b8', glow: 'rgba(148,163,184,0.5)' },
  rare: { label: 'Raro', color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
  epic: { label: 'Épico', color: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  legendary: { label: 'Legendario', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
}

// Colores de plataforma
export const platformStyles: Record<string, { label: string; color: string }> = {
  twitch: { label: 'Twitch', color: '#9146ff' },
  kick: { label: 'Kick', color: '#53fc18' },
  youtube: { label: 'YouTube', color: '#ff0000' },
}

export const storeTypeLabels: Record<string, string> = {
  logo: 'Logo',
  balloon: 'Globo de Texto',
  banner: 'Banner',
  frame: 'Marco',
}

export const categoryLabels: Record<string, string> = {
  roblox: 'Roblox',
  minecraft: 'Minecraft',
  valorant: 'Valorant',
  fortnite: 'Fortnite',
  lol: 'League of Legends',
  'free-fire': 'Free Fire',
  gta: 'GTA',
  cs2: 'CS2',
  genshin: 'Genshin',
  'among-us': 'Among Us',
  cod: 'Call of Duty',
  pokemon: 'Pokémon',
  'just-chatting': 'Just Chatting',
  'game-dev': 'Game Dev',
}
