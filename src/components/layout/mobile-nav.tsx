'use client'

import { useAppStore, type ViewKey } from '@/lib/store'
import { Home, Users, MessageCircle, MonitorPlay, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const items: { key: ViewKey; label: string; icon: any }[] = [
  { key: 'home', label: 'Inicio', icon: Home },
  { key: 'communities', label: 'Comunidades', icon: Users },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'streams', label: 'Stream', icon: MonitorPlay },
  { key: 'store', label: 'Tienda', icon: ShoppingBag },
]

export function MobileNav() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {items.map((it) => {
          const active = view === it.key
          const Icon = it.icon
          return (
            <button
              key={it.key}
              onClick={() => setView(it.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span>{it.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
