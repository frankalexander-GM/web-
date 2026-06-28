'use client'

import { cn } from '@/lib/utils'

export function LiveBadge({ className, viewers }: { className?: string; viewers?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md bg-red-600/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg', className)}>
      <span className="h-2 w-2 rounded-full bg-white live-dot" />
      En Vivo
      {viewers !== undefined && <span className="ml-0.5 font-semibold opacity-90">{viewers >= 1000 ? `${(viewers / 1000).toFixed(1)}K` : viewers}</span>}
    </span>
  )
}

export function PlatformBadge({ platform, className }: { platform: string; className?: string }) {
  const styles: Record<string, string> = {
    twitch: 'bg-[#9146ff]/20 text-[#b788ff] border-[#9146ff]/40',
    kick: 'bg-[#53fc18]/15 text-[#8aff52] border-[#53fc18]/40',
    youtube: 'bg-red-500/15 text-red-300 border-red-500/40',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize', styles[platform] || 'bg-muted text-muted-foreground border-border', className)}>
      {platform}
    </span>
  )
}

export function RarityBadge({ rarity }: { rarity: string }) {
  const styles: Record<string, string> = {
    common: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    rare: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    epic: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    legendary: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  }
  const labels: Record<string, string> = { common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' }
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', styles[rarity] || styles.common)}>
      {labels[rarity] || rarity}
    </span>
  )
}

export function SectionHeading({ title, subtitle, icon: Icon, action }: { title: string; subtitle?: string; icon?: any; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
