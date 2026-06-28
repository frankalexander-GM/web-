'use client'

import { useAppStore } from '@/lib/store'
import { Sparkles, Heart, Github, Twitter, Youtube } from 'lucide-react'

export function Footer() {
  const setView = useAppStore((s) => s.setView)

  return (
    <footer className="mt-auto border-t border-border/50 bg-sidebar/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold gradient-text">StreamVerse</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              La plataforma definitiva para streamers y comunidades gaming. Conecta, crea y streamea en un solo lugar con experiencia 3D inmersiva.
            </p>
            <div className="mt-4 flex gap-2">
              {[Twitter, Youtube, Github].map((Icon, i) => (
                <button key={i} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3">Explorar</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setView('communities')} className="hover:text-foreground transition-colors">Comunidades</button></li>
              <li><button onClick={() => setView('streams')} className="hover:text-foreground transition-colors">Streaming</button></li>
              <li><button onClick={() => setView('store')} className="hover:text-foreground transition-colors">Tienda</button></li>
              <li><button onClick={() => setView('chat')} className="hover:text-foreground transition-colors">Chat Mundial</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-foreground transition-colors">Centro de ayuda</button></li>
              <li><button className="hover:text-foreground transition-colors">Términos</button></li>
              <li><button className="hover:text-foreground transition-colors">Privacidad</button></li>
              <li><button className="hover:text-foreground transition-colors">Contacto</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2025 StreamVerse. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" /> para streamers
          </p>
        </div>
      </div>
    </footer>
  )
}
