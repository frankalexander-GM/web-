'use client'

import { useAppStore } from '@/lib/store'
import { FrameAvatar } from '@/components/shared/frame-avatar'
import { LiveBadge, PlatformBadge, SectionHeading } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Flame, Users, ShoppingBag, ArrowRight, Play, Zap, Heart, MessageCircle, TrendingUp, Cpu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatCount, timeAgo, categoryLabels } from '@/lib/format'
import { toast } from 'sonner'
import { useRecommendations } from '@/hooks/use-recommendations'

interface Streamer {
  id: string
  username: string
  displayName: string
  avatar: string | null
  bio: string | null
  platform: string | null
  channelHandle: string | null
  level: number
  followersCount: number
  isLive: { viewers: number; title: string; category: string } | null
}

interface Community {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  category: string
  color: string
  membersCount: number
  joined: boolean
}

interface Post {
  id: string
  content: string
  image: string | null
  likesCount: number
  commentsCount: number
  createdAt: string
  liked: boolean
  author: { id: string; username: string; displayName: string; avatar: string | null; isStreamer: boolean }
}

interface StoreItem {
  id: string
  type: string
  name: string
  price: number
  image: string
  color: string | null
  rarity: string
  sales: number
}

export function HomeView() {
  const setView = useAppStore((s) => s.setView)
  const openProfile = useAppStore((s) => s.openProfile)
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/streamers').then((r) => r.json()),
      fetch('/api/communities').then((r) => r.json()),
      fetch('/api/posts').then((r) => r.json()),
      fetch('/api/store').then((r) => r.json()),
    ])
      .then(([s, c, p, st]) => {
        setStreamers(s.streamers || [])
        setCommunities((c.communities || []).slice(0, 6))
        setPosts((p.posts || []).slice(0, 5))
        setStoreItems((st.items || []).slice(0, 4))
      })
      .catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false))
  }, [])

  const liveStreamers = streamers.filter((s) => s.isLive)
  const { streamers: recommended, loading: recLoading } = useRecommendations()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* HERO 3D */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-purple-950/50 via-background to-background mb-10 grid-bg">
        {/* 3D canvas: decorativo, confinado a la mitad derecha en desktop */}
        <div className="absolute inset-0 lg:left-[42%] pointer-events-none">
          <Hero3DLazy />
        </div>
        {/* Overlay degradado para legibilidad del texto a la izquierda */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent lg:from-background lg:via-background/70 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="relative grid gap-6 p-6 sm:p-10 lg:grid-cols-2 lg:items-center min-h-[440px]">
          <div className="space-y-5 relative">
            <Badge className="border-pink-500/40 bg-pink-500/15 text-pink-200 hover:bg-pink-500/20 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" /> Plataforma 3D para streamers
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
              Donde los <span className="gradient-text">streamers</span> y comunidades cobran vida
            </h1>
            <p className="max-w-lg text-base text-foreground/80 sm:text-lg">
              Comunidades de Roblox, Minecraft, Valorant y más. Chat mundial en tiempo real, hub de streaming multiplataforma, tienda de diseños y perfiles únicos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 glow-purple" onClick={() => setView('streams')}>
                <Play className="h-4 w-4" /> Ver Streams en Vivo
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-border/60 bg-card/50 backdrop-blur" onClick={() => setView('communities')}>
                <Users className="h-4 w-4" /> Explorar Comunidades
              </Button>
            </div>
            <div className="flex items-center gap-5 pt-2 sm:gap-6">
              <div>
                <p className="text-2xl font-extrabold gradient-text-pink sm:text-3xl">{formatCount(streamers.length * 12400)}</p>
                <p className="text-xs text-foreground/60">Streamers</p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <p className="text-2xl font-extrabold gradient-text-pink sm:text-3xl">{formatCount(communities.reduce((a, c) => a + c.membersCount, 0))}</p>
                <p className="text-xs text-foreground/60">Miembros</p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <p className="text-2xl font-extrabold gradient-text-pink sm:text-3xl">{liveStreamers.length}</p>
                <p className="text-xs text-foreground/60">En vivo ahora</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block h-[380px]" />
        </div>
      </section>

      {/* STREAMS EN VIVO */}
      <section className="mb-12">
        <SectionHeading
          title="En Vivo Ahora"
          subtitle="Streamers transmitiendo en este momento"
          icon={Flame}
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => setView('streams')}>
              Ver todos <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-card/40 shimmer" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveStreamers.slice(0, 4).map((s) => (
              <Card
                key={s.id}
                className="group relative overflow-hidden border-border/50 bg-card/60 p-0 cursor-pointer transition-all hover:border-primary/50 hover:glow-purple"
                onClick={() => { openProfile(s.id); }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={s.avatar || ''} alt={s.displayName} className="h-full w-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />
                  <div className="absolute left-2 top-2">
                    <LiveBadge viewers={s.isLive!.viewers} />
                  </div>
                  {s.platform && <div className="absolute right-2 top-2"><PlatformBadge platform={s.platform} /></div>}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="truncate text-sm font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{s.isLive!.title}</p>
                    <p className="text-[11px] font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{categoryLabels[s.isLive!.category] || s.isLive!.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3">
                  <FrameAvatar src={s.avatar} fallback={s.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{s.displayName}</p>
                    <p className="text-[11px] text-foreground/60">{formatCount(s.followersCount)} seguidores</p>
                  </div>
                  <Button size="sm" variant="secondary" className="h-7 gap-1 text-xs shrink-0" onClick={(e) => { e.stopPropagation(); setView('streams'); }}>
                    <Play className="h-3 w-3" /> Ver
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* RECOMENDACIONES (Powered by Java) */}
      {recommended.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            title="Recomendado para ti"
            subtitle="Algoritmo de scoring en Java"
            icon={Cpu}
            action={
              <Badge variant="outline" className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Java · puerto 3005
              </Badge>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(0, 6).map((s, i) => (
              <Card
                key={s.id}
                className="group flex items-center gap-3 border-border/50 bg-card/50 p-3 transition-all hover:border-primary/40 cursor-pointer"
                onClick={() => openProfile(s.id)}
              >
                <div className="relative">
                  <img src={s.avatar} alt={s.displayName} className="h-12 w-12 rounded-xl object-cover border border-border/50" loading="lazy" />
                  {s.isLive && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-card live-dot" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.isLive ? `${formatCount(s.liveViewers)} viendo · ${categoryLabels[s.liveCategory] || s.liveCategory}` : `${formatCount(s.followersCount)} seguidores`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-bold text-amber-400">#{i + 1}</span>
                  <span className="text-[9px] text-muted-foreground">score {s.score.toFixed(1)}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* COMUNIDADES TRENDING + TIENDA */}
      <div className="grid gap-8 mb-12 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeading
            title="Comunidades Trending"
            subtitle="Únete a millones de gamers"
            icon={TrendingUp}
            action={
              <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => setView('communities')}>
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {communities.map((c) => (
              <Card
                key={c.id}
                className="group flex items-center gap-3 border-border/50 bg-card/50 p-3 transition-all hover:border-primary/40 cursor-pointer"
                onClick={() => setView('communities')}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}66)` }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatCount(c.membersCount)} miembros</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <Users className="h-3 w-3" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Tienda Destacada"
            subtitle="Diseños exclusivos"
            icon={ShoppingBag}
            action={
              <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => setView('store')}>
                Ver <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
          <div className="grid grid-cols-2 gap-3">
            {storeItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-border/50 bg-card/50 p-0 cursor-pointer transition-all hover:border-primary/40" onClick={() => setView('store')}>
                <div className="relative aspect-square overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <p className="truncate text-xs font-bold text-white">{item.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.type}</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400">
                    <Zap className="h-3 w-3" /> {item.price}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* FEED DE PUBLICACIONES */}
      <section>
        <SectionHeading
          title="Actividad Reciente"
          subtitle="Lo que está pasando en la comunidad"
          icon={MessageCircle}
        />
        <div className="grid gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => openProfile(p.author.id)}>
                  <FrameAvatar src={p.author.avatar} fallback={p.author.displayName} size="md" ring={p.author.isStreamer} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openProfile(p.author.id)} className="truncate text-sm font-semibold hover:text-primary">
                      {p.author.displayName}
                    </button>
                    {p.author.isStreamer && <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/15 text-primary">STREAMER</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3">{p.content}</p>
              {p.image && (
                <img src={p.image} alt="" className="w-full max-h-80 object-cover rounded-xl mb-3" />
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className={`h-4 w-4 ${p.liked ? 'fill-pink-500 text-pink-500' : ''}`} /> {formatCount(p.likesCount)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" /> {formatCount(p.commentsCount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// Lazy load 3D para evitar bloquear el render
import dynamic from 'next/dynamic'
const Hero3DLazy = dynamic(() => import('@/components/three/hero-3d').then((m) => ({ default: m.Hero3D })), {
  ssr: false,
  loading: () => <div className="h-full w-full shimmer" />,
})
