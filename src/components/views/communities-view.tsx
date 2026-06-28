'use client'

import { useAppStore } from '@/lib/store'
import { SectionHeading } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Search,
  Check,
  UserPlus,
  UserMinus,
  Flame,
  Network,
  Gamepad2,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatCount, categoryLabels } from '@/lib/format'
import { toast } from 'sonner'

interface Community {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  banner: string | null
  category: string
  color: string
  membersCount: number
  joined: boolean
}

export function CommunitiesView() {
  const setView = useAppStore((s) => s.setView)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('todos')
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/communities')
      .then((r) => r.json())
      .then((data) => setCommunities(data.communities || []))
      .catch(() => toast.error('Error cargando comunidades'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    communities.forEach((c) => counts.set(c.category, (counts.get(c.category) || 0) + 1))
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)
  }, [communities])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return communities.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      const matchCategory = activeCategory === 'todos' || c.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [communities, search, activeCategory])

  const totalMembers = communities.reduce((a, c) => a + c.membersCount, 0)
  const joinedCount = communities.filter((c) => c.joined).length

  // Top 3 slugs by membersCount for "Trending" badge
  const trendingSlugs = useMemo(() => {
    return new Set(
      [...communities]
        .sort((a, b) => b.membersCount - a.membersCount)
        .slice(0, 3)
        .map((c) => c.slug),
    )
  }, [communities])

  async function toggleJoin(c: Community) {
    if (pendingSlug) return
    const action = c.joined ? 'leave' : 'join'
    setPendingSlug(c.slug)
    // Optimistic update
    setCommunities((prev) =>
      prev.map((x) =>
        x.slug === c.slug
          ? {
              ...x,
              joined: action === 'join',
              membersCount: Math.max(0, x.membersCount + (action === 'join' ? 1 : -1)),
            }
          : x,
      ),
    )
    try {
      const res = await fetch(`/api/communities/${c.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCommunities((prev) =>
        prev.map((x) =>
          x.slug === c.slug ? { ...x, joined: data.joined, membersCount: data.membersCount } : x,
        ),
      )
      toast.success(data.joined ? `Te uniste a ${c.name}` : `Saliste de ${c.name}`)
    } catch {
      // Revert on error
      setCommunities((prev) =>
        prev.map((x) =>
          x.slug === c.slug
            ? {
                ...x,
                joined: action !== 'join',
                membersCount: Math.max(0, x.membersCount + (action === 'join' ? -1 : 1)),
              }
            : x,
        ),
      )
      toast.error('Ocurrió un error')
    } finally {
      setPendingSlug(null)
    }
  }

  function clearFilters() {
    setSearch('')
    setActiveCategory('todos')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* HERO HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-purple-950/40 via-background to-background mb-8 grid-bg">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl float-y" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <SectionHeading
            title="Comunidades"
            subtitle="Únete a millones de gamers en tu comunidad favorita"
            icon={Users}
            action={
              <Badge className="hidden sm:inline-flex border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/15">
                <Sparkles className="h-3 w-3" /> {formatCount(communities.length)} comunidades
              </Badge>
            }
          />

          {/* Search + stats */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar comunidades..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-card/60 border-border/60 backdrop-blur h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 glow-purple">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-extrabold leading-none gradient-text">{formatCount(totalMembers)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">miembros totales</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-extrabold leading-none text-emerald-400">{joinedCount}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">unidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <CategoryChip
            active={activeCategory === 'todos'}
            onClick={() => setActiveCategory('todos')}
            label="Todos"
            icon={Sparkles}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={categoryLabels[cat] || cat}
              icon={Gamepad2}
            />
          ))}
        </div>
      </div>

      {/* RESULT META BAR */}
      {!loading && (
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Mostrando <span className="font-semibold text-foreground">{filtered.length}</span> de{' '}
            <span className="font-semibold text-foreground">{communities.length}</span> comunidades
          </span>
          {(search || activeCategory !== 'todos') && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden border-border/50 bg-card/40 p-0">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="p-4 pt-9 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-8 w-full" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 bg-card/50 p-12 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground">
              <Search className="h-8 w-8" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-purple-500/5 blur-xl -z-10" />
          </div>
          <h3 className="text-lg font-bold mb-1">Sin resultados</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No encontramos comunidades que coincidan con tu búsqueda. Prueba con otro nombre o cambia la categoría.
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-1.5 border-border/60" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              pending={pendingSlug === c.slug}
              trending={trendingSlugs.has(c.slug)}
              onToggle={() => toggleJoin(c)}
            />
          ))}
        </div>
      )}

      {/* FOOTER CTA */}
      {!loading && communities.length > 0 && (
        <Card className="mt-10 relative overflow-hidden border-border/50 bg-gradient-to-r from-purple-950/30 via-card/40 to-pink-950/20 p-6 sm:p-8 text-center grid-bg">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-64 bg-purple-600/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 text-primary mb-3">
              <Network className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-1">
              Crea tu propia <span className="gradient-text-pink">comunidad</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Reúne a tus seguidores, organiza eventos y construye tu espacio en StreamVerse.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 glow-purple">
                <Sparkles className="h-4 w-4" /> Crear comunidad
              </Button>
              <Button variant="outline" className="gap-2 border-border/60 bg-card/40 backdrop-blur" onClick={() => setView('streams')}>
                <Flame className="h-4 w-4" /> Ver streams
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: any
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'border-primary bg-primary text-primary-foreground glow-purple'
          : 'border-border/60 bg-card/40 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-primary/40'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function CommunityCard({
  community,
  pending,
  trending,
  onToggle,
}: {
  community: Community
  pending: boolean
  trending: boolean
  onToggle: () => void
}) {
  const { name, description, category, color, membersCount, joined } = community

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 p-0 transition-all hover:border-primary/40 hover:glow-purple">
      {/* Banner */}
      <div
        className="relative h-24 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}44)` }}
      >
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Trending / Joined badges */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {trending && (
            <Badge className="border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/20">
              <Flame className="h-3 w-3" /> Trending
            </Badge>
          )}
          {joined && (
            <Badge className="border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
              <Check className="h-3 w-3" /> Unido
            </Badge>
          )}
        </div>

        {/* Letter icon */}
        <div
          className="absolute -bottom-7 left-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold text-white border-4 border-card shadow-lg transition-transform group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            boxShadow: `0 8px 24px -8px ${color}aa`,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-9 pb-4">
        <div className="mb-2">
          <h3 className="font-bold leading-tight truncate">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{categoryLabels[category] || category}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">{description}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5 text-primary/70" />
            <span className="font-bold text-foreground">{formatCount(membersCount)}</span>
            <span className="text-muted-foreground">miembros</span>
          </div>

          {joined ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onToggle}
              className="group/join gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/40"
            >
              {pending ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Saliendo...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 group-hover/join:hidden" />
                  <UserMinus className="h-3.5 w-3.5 hidden group-hover/join:inline" />
                  <span className="group-hover/join:hidden">Miembro</span>
                  <span className="hidden group-hover/join:inline">Salir</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={pending}
              onClick={onToggle}
              className="gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              {pending ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Uniéndose...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Unirse
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
