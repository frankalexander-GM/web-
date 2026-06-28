'use client'

/**
 * Hook: useRecommendations
 * ========================
 * Consume el servicio de recomendaciones en Java (puerto 3005 vía gateway).
 * Cachea los resultados en memoria para evitar refetch innecesario.
 */
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface RecommendedStreamer {
  id: string
  username: string
  displayName: string
  avatar: string
  platform: string
  channelHandle: string
  level: number
  followersCount: number
  isLive: boolean
  liveViewers: number
  liveTitle: string
  liveCategory: string
  score: number
}

export interface RecommendedCommunity {
  id: string
  name: string
  slug: string
  description: string
  category: string
  color: string
  membersCount: number
}

interface Stats {
  totalStreamers: number
  liveNow: number
  totalFollowers: number
  totalLiveViewers: number
}

// Cache simple en memoria del módulo (evita refetch al cambiar de vista)
let cachedStreamers: RecommendedStreamer[] | null = null
let cachedCommunities: RecommendedCommunity[] | null = null
let cachedStats: Stats | null = null

export function useRecommendations() {
  const [streamers, setStreamers] = useState<RecommendedStreamer[]>(cachedStreamers ?? [])
  const [communities, setCommunities] = useState<RecommendedCommunity[]>(cachedCommunities ?? [])
  const [stats, setStats] = useState<Stats | null>(cachedStats)
  const [loading, setLoading] = useState(!cachedStreamers)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [sRes, cRes, stRes] = await Promise.all([
          fetch('/api/recommendations/streamers?XTransformPort=3005').then((r) => r.json()),
          fetch('/api/recommendations/communities?XTransformPort=3005').then((r) => r.json()),
          fetch('/api/stats?XTransformPort=3005').then((r) => r.json()),
        ])
        if (cancelled) return
        cachedStreamers = sRes.recommendations ?? []
        cachedCommunities = cRes.recommendations ?? []
        cachedStats = stRes
        setStreamers(cachedStreamers)
        setCommunities(cachedCommunities)
        setStats(cachedStats)
      } catch {
        if (!cancelled) toast.error('Error cargando recomendaciones')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (!cachedStreamers) load()
    return () => { cancelled = true }
  }, [])

  return { streamers, communities, stats, loading }
}
