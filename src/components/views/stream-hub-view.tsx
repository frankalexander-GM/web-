'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCount, categoryLabels, platformStyles } from '@/lib/format'
import { SectionHeading, LiveBadge, PlatformBadge } from '@/components/shared/badges'
import { FrameAvatar } from '@/components/shared/frame-avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  MonitorPlay,
  Play,
  Users,
  Eye,
  ExternalLink,
  Radio,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamStreamer {
  id: string
  username: string
  displayName: string
  avatar: string | null
  platform: string | null
  channelHandle: string | null
}

interface Stream {
  id: string
  platform: string
  channel: string
  title: string
  category: string
  thumbnail: string
  viewers: number
  isLive: boolean
  streamerId: string | null
  streamer: StreamStreamer
}

type FilterKey = 'all' | 'twitch' | 'kick' | 'youtube'

/** Construye la URL de embed según la plataforma (Twitch / Kick / YouTube). */
function getEmbedUrl(platform: string, channel: string): string {
  if (platform === 'twitch') {
    return `https://player.twitch.tv/?channel=${channel}&parent=localhost&autoplay=true&muted=false`
  }
  if (platform === 'kick') {
    return `https://player.kick.com/${channel}`
  }
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${channel}?autoplay=1`
  }
  return ''
}

/** URL externa al canal (para el botón "Abrir en plataforma"). */
function getChannelUrl(platform: string, channel: string): string {
  if (platform === 'twitch') return `https://www.twitch.tv/${channel}`
  if (platform === 'kick') return `https://kick.com/${channel}`
  if (platform === 'youtube') return `https://www.youtube.com/watch?v=${channel}`
  return '#'
}

export function StreamHubView() {
  const openProfile = useAppStore((s) => s.openProfile)

  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  // Fetch de streams al montar
  useEffect(() => {
    let cancelled = false
    fetch('/api/streams')
      .then((r) => {
        if (!r.ok) throw new Error('fetch-failed')
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        const list: Stream[] = data.streams || []
        setStreams(list)
        // Auto-seleccionar el primero (mayor cantidad de viewers, ya viene ordenado)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => {
        if (!cancelled) toast.error('No se pudieron cargar los streams')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Conteo por plataforma para las pestañas
  const counts = useMemo(() => {
    return {
      all: streams.length,
      twitch: streams.filter((s) => s.platform === 'twitch').length,
      kick: streams.filter((s) => s.platform === 'kick').length,
      youtube: streams.filter((s) => s.platform === 'youtube').length,
    }
  }, [streams])

  // Streams filtrados según la pestaña activa
  const filteredStreams = useMemo(() => {
    if (filter === 'all') return streams
    return streams.filter((s) => s.platform === filter)
  }, [streams, filter])

  // Stream seleccionado (objeto completo)
  const selected = useMemo(() => {
    if (!selectedId) return null
    return streams.find((s) => s.id === selectedId) || null
  }, [streams, selectedId])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  // Pestañas de filtro
  const filters: { key: FilterKey; label: string; count: number; color?: string }[] = [
    { key: 'all', label: 'Todas', count: counts.all },
    { key: 'twitch', label: 'Twitch', count: counts.twitch, color: platformStyles.twitch?.color },
    { key: 'kick', label: 'Kick', count: counts.kick, color: platformStyles.kick?.color },
    { key: 'youtube', label: 'YouTube', count: counts.youtube, color: platformStyles.youtube?.color },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* HEADER */}
      <SectionHeading
        title="Hub de Streaming"
        subtitle="Twitch, Kick y YouTube en un solo lugar"
        icon={MonitorPlay}
        action={
          <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            <Radio className="h-3 w-3" /> {formatCount(streams.reduce((a, s) => a + s.viewers, 0))} viendo
          </Badge>
        }
      />

      {/* FILTROS POR PLATAFORMA */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const isActive = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'group relative inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all',
                isActive
                  ? 'border-primary/60 bg-primary/15 text-foreground glow-purple'
                  : 'border-border/50 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
              style={isActive && f.color ? { boxShadow: `0 0 18px ${f.color}55, 0 0 36px ${f.color}22`, borderColor: `${f.color}88` } : undefined}
            >
              {f.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: f.color, boxShadow: `0 0 8px ${f.color}` }}
                />
              )}
              {f.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  isActive ? 'bg-primary/30 text-foreground' : 'bg-muted/60 text-muted-foreground'
                )}
              >
                {f.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* LAYOUT PRINCIPAL */}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : streams.length === 0 ? (
        <Card className="grid-bg flex min-h-[320px] items-center justify-center border-border/50 bg-card/40 p-10 text-center">
          <div className="space-y-2">
            <MonitorPlay className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No hay streams en vivo ahora mismo</p>
            <p className="text-sm text-muted-foreground">Vuelve más tarde para ver a tus streamers favoritos.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* COLUMNA PRINCIPAL — REPRODUCTOR */}
          <div className="lg:col-span-2">
            {selected ? (
              <PlayerPanel stream={selected} onOpenProfile={() => openProfile(selected.streamer.id)} />
            ) : (
              <Card className="grid-bg flex aspect-video w-full items-center justify-center rounded-2xl border-border/50 bg-card/40 p-10 text-center">
                <div className="space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Play className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-semibold">Selecciona un stream</p>
                  <p className="text-sm text-muted-foreground">Elige un directo de la lista para empezar a ver.</p>
                </div>
              </Card>
            )}
          </div>

          {/* COLUMNA DERECHA — LISTA DE STREAMS */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col overflow-hidden border-border/50 bg-card/50">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-pink-400" />
                  <h3 className="text-sm font-bold">Directos ahora</h3>
                </div>
                <Badge variant="secondary" className="bg-pink-500/15 text-pink-300">{filteredStreams.length}</Badge>
              </div>

              <div className="max-h-[600px] overflow-y-auto scrollbar-neon p-2">
                {filteredStreams.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay streams de esta plataforma en vivo.
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {filteredStreams.map((s) => {
                      const isActive = s.id === selectedId
                      const pColor = platformStyles[s.platform]?.color
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => handleSelect(s.id)}
                            className={cn(
                              'group relative flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-all',
                              isActive
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent hover:border-border/60 hover:bg-accent/40'
                            )}
                            style={isActive && pColor ? { boxShadow: `inset 0 0 0 1px ${pColor}66, 0 0 14px ${pColor}22` } : undefined}
                          >
                            {/* Thumbnail */}
                            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                              <img
                                src={s.thumbnail}
                                alt={s.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                              <div className="absolute left-1 top-1">
                                <LiveBadge viewers={s.viewers} />
                              </div>
                              {isActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-semibold leading-tight">{s.title}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{s.streamer.displayName}</p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <PlatformBadge platform={s.platform} />
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Eye className="h-3 w-3" /> {formatCount(s.viewers)}
                                </span>
                              </div>
                            </div>

                            <ChevronRight
                              className={cn(
                                'h-4 w-4 shrink-0 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground'
                              )}
                            />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ExternalLink className="h-3 w-3" />
        Streamings embebidos desde sus plataformas originales
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  PANEL DEL REPRODUCTOR                                                     */
/* -------------------------------------------------------------------------- */

function PlayerPanel({ stream, onOpenProfile }: { stream: Stream; onOpenProfile: () => void }) {
  const embedUrl = getEmbedUrl(stream.platform, stream.channel)
  const channelUrl = getChannelUrl(stream.platform, stream.channel)
  const pStyle = platformStyles[stream.platform]
  const pColor = pStyle?.color

  return (
    <div className="space-y-3">
      {/* IFRAME */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-black glow-purple"
        style={pColor ? { boxShadow: `0 0 24px ${pColor}40, 0 0 60px ${pColor}18` } : undefined}
      >
        <div className="aspect-video w-full">
          <iframe
            key={stream.id}
            src={embedUrl}
            title={`${stream.streamer.displayName} en ${stream.platform}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
        {/* Barra superior overlay con info rápida */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <LiveBadge viewers={stream.viewers} />
          <PlatformBadge platform={stream.platform} />
        </div>
      </div>

      {/* INFO DEL STREAM */}
      <Card className="border-border/50 bg-card/50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Streamer */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={onOpenProfile} className="shrink-0">
              <FrameAvatar
                src={stream.streamer.avatar}
                fallback={stream.streamer.displayName}
                size="md"
                ring
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="truncate text-base font-bold hover:text-primary"
                >
                  {stream.streamer.displayName}
                </button>
                <PlatformBadge platform={stream.platform} />
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                {categoryLabels[stream.category] || stream.category}
                {stream.streamer.channelHandle && (
                  <span className="ml-1 opacity-70">· @{stream.streamer.channelHandle}</span>
                )}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-pink-300">
                <Users className="h-3 w-3" /> {formatCount(stream.viewers)} viendo ahora
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              onClick={onOpenProfile}
            >
              <MonitorPlay className="h-4 w-4" /> Ver perfil
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-border/60 bg-card/40"
              asChild
            >
              <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Abrir
              </a>
            </Button>
          </div>
        </div>

        {/* Título del stream */}
        <div className="mt-3 border-t border-border/40 pt-3">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-foreground">Ahora jugando: </span>
            <span className="text-muted-foreground">{stream.title}</span>
          </p>
        </div>
      </Card>
    </div>
  )
}
