'use client'

import { useAppStore } from '@/lib/store'
import { SectionHeading, RarityBadge } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShoppingBag,
  Coins,
  Zap,
  Check,
  Sparkles,
  Crown,
  Image as ImageIcon,
  MessageSquare,
  Frame,
  User,
  TrendingUp,
  Search,
  Filter,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { rarityStyles, storeTypeLabels } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StoreItem {
  id: string
  type: string
  name: string
  description: string | null
  price: number
  image: string
  preview?: string | null
  creator: string | null
  rarity: string
  color: string | null
  sales: number
  owned: boolean
}

type TypeFilter = 'all' | 'logo' | 'balloon' | 'banner' | 'frame'
type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary'

const TYPE_FILTERS: { key: TypeFilter; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'Todos', icon: Sparkles },
  { key: 'logo', label: 'Logos', icon: ImageIcon },
  { key: 'balloon', label: 'Globos', icon: MessageSquare },
  { key: 'banner', label: 'Banners', icon: ImageIcon },
  { key: 'frame', label: 'Marcos', icon: Frame },
]

const RARITY_FILTERS: { key: RarityFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'common', label: 'Común' },
  { key: 'rare', label: 'Raro' },
  { key: 'epic', label: 'Épico' },
  { key: 'legendary', label: 'Legendario' },
]

const TYPE_GROUPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'frame', label: 'Marcos', icon: Frame },
  { key: 'banner', label: 'Banners', icon: ImageIcon },
  { key: 'logo', label: 'Logos', icon: ImageIcon },
  { key: 'balloon', label: 'Globos', icon: MessageSquare },
]

// Hover glow per rarity (static class strings so Tailwind can scan them)
const rarityHoverGlow: Record<string, string> = {
  common: 'hover:border-slate-400/60 hover:shadow-[0_0_28px_rgba(148,163,184,0.30)]',
  rare: 'hover:border-cyan-400/60 hover:shadow-[0_0_28px_rgba(6,182,212,0.45)]',
  epic: 'hover:border-purple-400/60 hover:shadow-[0_0_28px_rgba(168,85,247,0.50)]',
  legendary: 'hover:border-amber-400/70 hover:shadow-[0_0_34px_rgba(245,158,11,0.55)]',
}

// ──────────────────────────────────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center grid-bg">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-base font-bold">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Shop item card
// ──────────────────────────────────────────────────────────────────────────
function StoreItemCard({
  item,
  coins,
  purchasing,
  onPurchase,
  onEquip,
  equippedFrameId,
  equipping,
}: {
  item: StoreItem
  coins: number
  purchasing: boolean
  onPurchase: (item: StoreItem) => void
  onEquip: (itemId: string) => void
  equippedFrameId: string | null
  equipping: boolean
}) {
  const rs = rarityStyles[item.rarity] || rarityStyles.common
  const owned = item.owned
  const canAfford = coins >= item.price
  const isEquipped = item.type === 'frame' && equippedFrameId === item.id
  const isLegendary = item.rarity === 'legendary'

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border bg-card/50 p-0 transition-all duration-300 hover:-translate-y-1',
        rarityHoverGlow[item.rarity] || rarityHoverGlow.common,
      )}
      style={{ borderColor: `${rs.color}40` }}
    >
      {/* Legendary crown ribbon */}
      {isLegendary && (
        <div className="absolute left-0 top-0 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
          <Crown className="h-2.5 w-2.5" /> Top
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        {/* Type label */}
        <span className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {storeTypeLabels[item.type] || item.type}
        </span>
        {/* Rarity badge */}
        <div className="absolute right-2 top-2">
          <RarityBadge rarity={item.rarity} />
        </div>
        {/* Sales */}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
          {item.sales}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight">{item.name}</h3>
          {item.creator && (
            <p className="truncate text-[11px] text-muted-foreground">
              por <span className="text-primary/80">@{item.creator}</span>
            </p>
          )}
        </div>
        {item.description && (
          <p className="line-clamp-2 min-h-[2rem] text-xs leading-snug text-muted-foreground/80">
            {item.description}
          </p>
        )}

        {/* Footer: price + action */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-amber-400" />
            {item.price}
          </span>
          <div className="flex items-center gap-1.5">
            {owned && item.type === 'frame' && (
              <Button
                size="sm"
                variant="outline"
                disabled={isEquipped || equipping}
                onClick={() => onEquip(item.id)}
                className={cn(
                  'h-7 gap-1 px-2 text-[11px]',
                  isEquipped && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
                )}
              >
                {isEquipped ? (
                  <>
                    <Check className="h-3 w-3" /> Equipado
                  </>
                ) : equipping ? (
                  '…'
                ) : (
                  <>
                    <Frame className="h-3 w-3" /> Equipar
                  </>
                )}
              </Button>
            )}
            {owned ? (
              <Button
                size="sm"
                disabled
                className="h-7 gap-1 border border-emerald-500/40 bg-emerald-500/15 px-2 text-[11px] text-emerald-300"
              >
                <Check className="h-3 w-3" /> Adquirido
              </Button>
            ) : canAfford ? (
              <Button
                size="sm"
                disabled={purchasing}
                onClick={() => onPurchase(item)}
                className="h-7 gap-1 bg-gradient-to-r from-purple-600 to-pink-600 px-3 text-[11px] hover:opacity-90"
              >
                {purchasing ? (
                  '…'
                ) : (
                  <>
                    <Zap className="h-3 w-3" /> Comprar
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled
                className="h-7 gap-1 border border-red-500/30 bg-red-500/10 px-2 text-[11px] text-red-300/80"
              >
                Insuficiente
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// My item card (inventory)
// ──────────────────────────────────────────────────────────────────────────
function MyItemCard({
  item,
  equipped,
  equipping,
  onEquip,
  displayName,
  initial,
}: {
  item: StoreItem
  equipped: boolean
  equipping: boolean
  onEquip: (itemId: string) => void
  displayName: string
  initial: string
}) {
  const rs = rarityStyles[item.rarity] || rarityStyles.common
  const isBanner = item.type === 'banner'

  if (isBanner) {
    // Profile banner preview
    return (
      <Card
        className={cn(
          'group overflow-hidden border bg-card/50 p-0 transition-all duration-300',
          rarityHoverGlow[item.rarity] || rarityHoverGlow.common,
        )}
        style={{ borderColor: `${rs.color}40` }}
      >
        <div className="relative aspect-[3/1] overflow-hidden">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute right-2 top-2">
            <RarityBadge rarity={item.rarity} />
          </div>
        </div>
        <div className="relative -mt-6 px-3 pb-3">
          <div className="flex items-end gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-extrabold text-white shadow-lg">
              {initial}
            </div>
            <div className="min-w-0 pb-1">
              <p className="truncate text-sm font-bold leading-tight">{displayName}</p>
              <p className="truncate text-[11px] text-muted-foreground">vista previa del banner</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
            <span className="truncate text-xs font-semibold">{item.name}</span>
            <Badge variant="secondary" className="bg-secondary/60 text-[10px]">Banner</Badge>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border bg-card/50 p-0 transition-all duration-300 hover:-translate-y-1',
        rarityHoverGlow[item.rarity] || rarityHoverGlow.common,
      )}
      style={{ borderColor: `${rs.color}40` }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute right-2 top-2">
          <RarityBadge rarity={item.rarity} />
        </div>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {storeTypeLabels[item.type] || item.type}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight">{item.name}</h3>
          {item.creator && (
            <p className="truncate text-[11px] text-muted-foreground">por @{item.creator}</p>
          )}
        </div>

        {item.type === 'frame' &&
          (equipped ? (
            <Button size="sm" disabled className="h-8 gap-1 border border-emerald-500/40 bg-emerald-500/15 text-xs text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Equipado
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onEquip(item.id)}
              disabled={equipping}
              className="h-8 gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs hover:opacity-90"
            >
              {equipping ? (
                '…'
              ) : (
                <>
                  <Frame className="h-3.5 w-3.5" /> Equipar
                </>
              )}
            </Button>
          ))}

        {item.type !== 'frame' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span className="font-semibold">En tu inventario</span>
          </div>
        )}
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Main StoreView
// ──────────────────────────────────────────────────────────────────────────
export function StoreView() {
  const currentUser = useAppStore((s) => s.currentUser)
  const refreshUser = useAppStore((s) => s.refreshUser)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingIds, setPurchasingIds] = useState<Set<string>>(new Set())

  const [myItems, setMyItems] = useState<StoreItem[]>([])
  const [myItemsLoading, setMyItemsLoading] = useState(false)
  const [myItemsLoaded, setMyItemsLoaded] = useState(false)
  const [equippedFrameId, setEquippedFrameId] = useState<string | null>(null)
  const [equippingIds, setEquippingIds] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<string>('shop')

  const coins = currentUser?.coins ?? 0
  const displayName = currentUser?.displayName || 'Tú'
  const initial = (displayName.charAt(0) || 'T').toUpperCase()

  // Load shop items based on filters
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (rarityFilter !== 'all') params.set('rarity', rarityFilter)
    const qs = params.toString() ? `?${params.toString()}` : ''
    fetch(`/api/store${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setItems(data.items || [])
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Error cargando la tienda')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [typeFilter, rarityFilter])

  const loadMyItems = useCallback(async () => {
    setMyItemsLoading(true)
    try {
      const res = await fetch('/api/store/my-items')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMyItems(data.items || [])
      setEquippedFrameId(data.equippedFrameId ?? null)
      setMyItemsLoaded(true)
    } catch {
      toast.error('Error cargando tu inventario')
    } finally {
      setMyItemsLoading(false)
    }
  }, [])

  // Load my-items on mount (so equippedFrameId is known for shop tab too)
  useEffect(() => {
    loadMyItems()
  }, [loadMyItems])

  const handlePurchase = async (item: StoreItem) => {
    if (purchasingIds.has(item.id)) return
    setPurchasingIds((prev) => new Set(prev).add(item.id))
    try {
      const res = await fetch(`/api/store/${item.id}/purchase`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'No se pudo completar la compra')
        return
      }
      toast.success(`¡Compra exitosa! "${item.name}" añadido a tu inventario`)
      // Optimistic: mark as owned + bump sales
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, owned: true, sales: it.sales + 1 } : it,
        ),
      )
      // Refresh user coin balance
      await refreshUser()
      // Refresh inventory in background so owned/equipped state is fresh
      loadMyItems()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setPurchasingIds((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const handleEquip = async (itemId: string) => {
    if (equippingIds.has(itemId)) return
    setEquippingIds((prev) => new Set(prev).add(itemId))
    try {
      const res = await fetch('/api/store/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'No se pudo equipar el marco')
        return
      }
      setEquippedFrameId(data.frameId)
      await refreshUser()
      toast.success('Marco equipado')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setEquippingIds((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleUnequip = async () => {
    try {
      const res = await fetch('/api/store/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'No se pudo quitar el marco')
        return
      }
      setEquippedFrameId(null)
      await refreshUser()
      toast.success('Marco quitado')
    } catch {
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <SectionHeading
        title="Tienda StreamVerse"
        subtitle="Diseños exclusivos para streamers"
        icon={ShoppingBag}
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-sm font-bold text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Coins className="h-4 w-4" />
            <span>{coins.toLocaleString('es')}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">coins</span>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="h-auto gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <TabsTrigger
            value="shop"
            className="gap-1.5 rounded-lg px-4 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <ShoppingBag className="h-4 w-4" /> Tienda
          </TabsTrigger>
          <TabsTrigger
            value="my-items"
            className="gap-1.5 rounded-lg px-4 py-1.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            <Package className="h-4 w-4" /> Mis Artículos
            {myItems.length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/30 px-1 text-[10px] font-bold text-primary-foreground">
                {myItems.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: TIENDA ─────────────────────────────────────────────── */}
        <TabsContent value="shop" className="mt-6">
          {/* Filter bar */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_FILTERS.map((f) => {
                const Icon = f.icon
                const active = typeFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setTypeFilter(f.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                      active
                        ? 'border-primary bg-primary text-primary-foreground glow-purple'
                        : 'border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" /> {f.label}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" /> Rareza
              </span>
              {RARITY_FILTERS.map((f) => {
                const active = rarityFilter === f.key
                const rs = f.key !== 'all' ? rarityStyles[f.key] : null
                return (
                  <button
                    key={f.key}
                    onClick={() => setRarityFilter(f.key)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all',
                      active && !rs && 'border-primary bg-primary/20 text-primary',
                      !active && 'border-border/50 text-muted-foreground hover:text-foreground',
                    )}
                    style={
                      active && rs
                        ? {
                            background: `${rs.color}25`,
                            borderColor: rs.color,
                            color: rs.color,
                          }
                        : undefined
                    }
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Items grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-border/40 bg-card/30"
                >
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-7 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No hay artículos con estos filtros"
              subtitle="Prueba con otra combinación de tipo o rareza."
              action={
                (typeFilter !== 'all' || rarityFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTypeFilter('all')
                      setRarityFilter('all')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  coins={coins}
                  purchasing={purchasingIds.has(item.id)}
                  onPurchase={handlePurchase}
                  onEquip={handleEquip}
                  equippedFrameId={equippedFrameId}
                  equipping={equippingIds.has(item.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAB: MIS ARTÍCULOS ─────────────────────────────────────── */}
        <TabsContent value="my-items" className="mt-6">
          {myItemsLoading && !myItemsLoaded ? (
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-3 h-7 w-40" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="overflow-hidden rounded-xl border border-border/40 bg-card/30"
                      >
                        <Skeleton className="aspect-square w-full rounded-none" />
                        <div className="space-y-2 p-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : myItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Tu inventario está vacío"
              subtitle="Compra artículos en la tienda para verlos aquí y personalizar tu perfil."
              action={
                <Button
                  size="sm"
                  onClick={() => setTab('shop')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                  <ShoppingBag className="h-4 w-4" /> Ir a la Tienda
                </Button>
              }
            />
          ) : (
            <div className="space-y-8">
              {/* Coin balance + equipped frame summary */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="mr-auto">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tu saldo</p>
                  <p className="text-lg font-extrabold text-amber-300">
                    {coins.toLocaleString('es')} coins
                  </p>
                </div>
                {equippedFrameId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnequip}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  >
                    Quitar marco actual
                  </Button>
                )}
              </div>

              {TYPE_GROUPS.map((group) => {
                const groupItems = myItems.filter((it) => it.type === group.key)
                if (groupItems.length === 0) return null
                const Icon = group.icon
                return (
                  <section key={group.key}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-bold">{group.label}</h3>
                      <Badge variant="secondary" className="bg-secondary/60 text-[10px]">
                        {groupItems.length}
                      </Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {groupItems.map((item) => (
                        <MyItemCard
                          key={item.id}
                          item={item}
                          equipped={item.type === 'frame' && equippedFrameId === item.id}
                          equipping={equippingIds.has(item.id)}
                          onEquip={handleEquip}
                          displayName={displayName}
                          initial={initial}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}

              {/* Hint when nothing is equipped */}
              {myItems.some((it) => it.type === 'frame') && !equippedFrameId && (
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Equipa un marco para personalizar tu avatar en todo StreamVerse.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
