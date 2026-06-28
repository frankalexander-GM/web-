'use client'

import { useAppStore, type ViewKey } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Home, Users, MessageCircle, MonitorPlay, ShoppingBag, User, Sparkles, Coins } from 'lucide-react'
import { FrameAvatar } from '@/components/shared/frame-avatar'

interface NavItem {
  key: ViewKey
  label: string
  icon: any
  color: string
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Inicio', icon: Home, color: '#a855f7' },
  { key: 'communities', label: 'Comunidades', icon: Users, color: '#ec4899' },
  { key: 'chat', label: 'Chat Mundial', icon: MessageCircle, color: '#06b6d4' },
  { key: 'streams', label: 'Streaming', icon: MonitorPlay, color: '#10b981' },
  { key: 'store', label: 'Tienda', icon: ShoppingBag, color: '#f59e0b' },
  { key: 'profile', label: 'Perfil', icon: User, color: '#8b5cf6' },
]

export function Sidebar() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const openProfile = useAppStore((s) => s.openProfile)
  const currentUser = useAppStore((s) => s.currentUser)

  return (
    <aside className="hidden md:flex w-[230px] shrink-0 flex-col border-r border-border/50 bg-sidebar/60 backdrop-blur-xl">
      {/* Logo */}
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2.5 px-5 h-16 border-b border-border/50"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-lg glow-purple">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-lg font-extrabold tracking-tight gradient-text">StreamVerse</span>
          <span className="text-[10px] text-muted-foreground font-medium">3D · Streamers · Community</span>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 scrollbar-neon overflow-y-auto">
        {navItems.map((item) => {
          const active = view === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => item.key === 'profile' && currentUser ? openProfile(currentUser.id) : setView(item.key)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                />
              )}
              <Icon
                className={cn('h-5 w-5 transition-colors', active ? 'text-primary' : 'group-hover:text-foreground')}
                style={active ? { color: item.color } : undefined}
              />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User card */}
      {currentUser && (
        <button
          onClick={() => openProfile(currentUser.id)}
          className="m-3 mt-0 flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 text-left transition-colors hover:bg-accent/40"
        >
          <FrameAvatar src={currentUser.avatar} fallback={currentUser.displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{currentUser.displayName}</p>
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Coins className="h-3 w-3" />
              <span className="font-medium">{currentUser.coins.toLocaleString()}</span>
            </div>
          </div>
        </button>
      )}
    </aside>
  )
}
