'use client'

import { useAppStore } from '@/lib/store'
import { FrameAvatar } from '@/components/shared/frame-avatar'
import { Search, Coins, Bell, Menu, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function TopBar() {
  const currentUser = useAppStore((s) => s.currentUser)
  const openProfile = useAppStore((s) => s.openProfile)
  const setView = useAppStore((s) => s.setView)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-extrabold gradient-text">StreamVerse</span>
      </div>

      {/* Search */}
      <div className="relative hidden sm:flex flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar streamers, comunidades, juegos..."
          className="pl-9 bg-card/50 border-border/50 focus-visible:ring-primary/40"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-300">{currentUser.coins.toLocaleString()}</span>
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pink-500 live-dot" />
        </Button>

        {currentUser && (
          <button
            onClick={() => openProfile(currentUser.id)}
            className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 p-1 pr-3 transition-colors hover:bg-accent/40"
          >
            <FrameAvatar src={currentUser.avatar} fallback={currentUser.displayName} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold leading-none">{currentUser.displayName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Nivel {currentUser.level}</p>
            </div>
          </button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <MobileNav onClose={() => setMobileOpen(false)} />
      )}
    </header>
  )
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const setView = useAppStore((s) => s.setView)
  const openProfile = useAppStore((s) => s.openProfile)
  const currentUser = useAppStore((s) => s.currentUser)

  const items = [
    { key: 'home', label: 'Inicio' },
    { key: 'communities', label: 'Comunidades' },
    { key: 'chat', label: 'Chat Mundial' },
    { key: 'streams', label: 'Streaming' },
    { key: 'store', label: 'Tienda' },
  ] as const

  return (
    <div className="absolute left-0 right-0 top-16 z-50 border-b border-border/50 bg-popover/95 backdrop-blur-xl p-3 md:hidden">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => { setView(it.key); onClose() }}
            className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <Zap className="h-4 w-4 text-primary" />
            {it.label}
          </button>
        ))}
        {currentUser && (
          <button
            onClick={() => { openProfile(currentUser.id); onClose() }}
            className="col-span-2 flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-2.5 text-sm font-medium hover:bg-primary/25"
          >
            <FrameAvatar src={currentUser.avatar} fallback={currentUser.displayName} size="sm" />
            Mi Perfil
          </button>
        )}
      </div>
    </div>
  )
}
