'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { FrameAvatar } from '@/components/shared/frame-avatar'
import { LiveBadge, PlatformBadge } from '@/components/shared/badges'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCount, timeAgo, categoryLabels } from '@/lib/format'
import { toast } from 'sonner'
import {
  User,
  Users,
  Heart,
  MessageCircle,
  Edit,
  UserPlus,
  UserCheck,
  UserMinus,
  Calendar,
  Play,
  Image as ImageIcon,
  Send,
  Award,
  Radio,
} from 'lucide-react'

interface ProfileUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
  banner: string | null
  bio: string | null
  isStreamer: boolean
  platform: string | null
  channelHandle: string | null
  level: number
  xp: number
  frameId: string | null
  createdAt: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
  isSelf: boolean
  liveStream: {
    id: string
    viewers: number
    title: string
    category: string
    platform: string
    channel: string
  } | null
  frame: { id: string; name: string; color: string; rarity: string } | null
}

interface Post {
  id: string
  content: string
  image: string | null
  likesCount: number
  commentsCount: number
  createdAt: string
  liked: boolean
  author: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    isStreamer: boolean
  }
}

const XP_MAX = 10000

export function ProfileView() {
  const profileUserId = useAppStore((s) => s.profileUserId)
  const currentUser = useAppStore((s) => s.currentUser)
  const setView = useAppStore((s) => s.setView)
  const openProfile = useAppStore((s) => s.openProfile)

  const targetId = profileUserId || currentUser?.id || null
  const isSelfDerived = !profileUserId || (!!currentUser && profileUserId === currentUser.id)

  const [user, setUser] = useState<ProfileUser | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!targetId) {
      setLoading(true)
      return
    }
    setLoading(true)
    try {
      const [uRes, pRes] = await Promise.all([
        fetch(`/api/users/${targetId}`).then((r) => r.json()),
        fetch(`/api/posts?authorId=${targetId}`).then((r) => r.json()),
      ])
      if (uRes.user) {
        setUser(uRes.user)
        setFollowing(uRes.user.isFollowing)
        setFollowersCount(uRes.user.followersCount)
      } else {
        setUser(null)
        toast.error('Usuario no encontrado')
      }
      setPosts(pRes.posts || [])
    } catch {
      toast.error('Error cargando perfil')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [targetId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleFollow = async () => {
    if (!user || isSelfDerived) return
    const prevFollowing = following
    const prevCount = followersCount
    // Optimistic
    setFollowing(!prevFollowing)
    setFollowersCount((c) => Math.max(0, c + (prevFollowing ? -1 : 1)))
    setFollowLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setFollowing(data.following)
        setFollowersCount(data.followersCount)
        toast.success(
          data.following ? `Ahora sigues a ${user.displayName}` : `Dejaste de seguir a ${user.displayName}`
        )
      } else {
        throw new Error()
      }
    } catch {
      setFollowing(prevFollowing)
      setFollowersCount(prevCount)
      toast.error('No se pudo actualizar')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleCreatePost = async () => {
    const content = newPost.trim()
    if (!content || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, image: null }),
      })
      const data = await res.json()
      if (res.ok && data.post) {
        setPosts((p) => [data.post as Post, ...p])
        setUser((u) => (u ? { ...u, postsCount: u.postsCount + 1 } : u))
        setNewPost('')
        toast.success('Publicación creada')
      } else {
        throw new Error()
      }
    } catch {
      toast.error('No se pudo publicar')
    } finally {
      setPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (likingId) return
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    const prevLiked = post.liked
    const prevCount = post.likesCount
    // Optimistic
    setPosts((p) =>
      p.map((x) =>
        x.id === postId
          ? { ...x, liked: !prevLiked, likesCount: Math.max(0, x.likesCount + (prevLiked ? -1 : 1)) }
          : x
      )
    )
    setLikingId(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setPosts((p) =>
          p.map((x) => (x.id === postId ? { ...x, liked: data.liked, likesCount: data.likesCount } : x))
        )
      } else {
        throw new Error()
      }
    } catch {
      setPosts((p) =>
        p.map((x) => (x.id === postId ? { ...x, liked: prevLiked, likesCount: prevCount } : x))
      )
      toast.error('No se pudo actualizar')
    } finally {
      setLikingId(null)
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Skeleton className="h-40 sm:h-56 w-full rounded-2xl" />
        <div className="px-4 sm:px-6 -mt-12 sm:-mt-16 relative">
          <Skeleton className="h-24 w-24 rounded-full ring-4 ring-background" />
        </div>
        <div className="px-4 sm:px-6 mt-4 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6 px-4 sm:px-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="mt-6 space-y-3 px-4 sm:px-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // NOT FOUND STATE
  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Card className="border-border/50 bg-card/50 p-12 text-center grid-bg">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-semibold">Perfil no disponible</p>
          <p className="text-sm text-muted-foreground mt-1">No se pudo cargar este perfil.</p>
          <Button
            className="mt-4 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 glow-purple"
            onClick={() => setView('home')}
          >
            Volver al inicio
          </Button>
        </Card>
      </div>
    )
  }

  const xpPct = Math.min(100, Math.max(0, Math.round((user.xp / XP_MAX) * 100)))
  const isSelf = user.isSelf || isSelfDerived

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* ============================ HEADER CARD ============================ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
          {/* BANNER */}
          <div className="relative h-40 sm:h-56 overflow-hidden">
            {user.banner ? (
              <img
                src={user.banner}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/30 to-cyan-900/40 grid-bg" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            {user.liveStream && (
              <div className="absolute right-3 top-3">
                <LiveBadge viewers={user.liveStream.viewers} />
              </div>
            )}
            {user.isStreamer && !user.liveStream && (
              <div className="absolute right-3 top-3">
                <Badge className="bg-purple-500/15 text-purple-200 border-purple-500/40 backdrop-blur">
                  <Radio className="h-3 w-3 mr-1" /> STREAMER
                </Badge>
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="px-4 sm:px-6 pb-6">
            {/* AVATAR + ACTION BUTTONS ROW */}
            <div className="flex flex-col gap-4 -mt-12 sm:-mt-16 sm:flex-row sm:items-end">
              <div className="shrink-0 self-start">
                <FrameAvatar
                  src={user.avatar}
                  fallback={user.displayName}
                  frameColor={user.frame?.color}
                  size="xl"
                  ring={user.isStreamer}
                  className="ring-4 ring-card rounded-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:mb-1">
                {isSelf ? (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast('Próximamente: edición de perfil')}
                  >
                    <Edit className="h-4 w-4" /> Editar perfil
                  </Button>
                ) : following ? (
                  <Button
                    variant="secondary"
                    className="group gap-2 min-w-[148px] justify-center"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    <UserCheck className="h-4 w-4 group-hover:hidden" />
                    <UserMinus className="hidden h-4 w-4 group-hover:block" />
                    <span className="group-hover:hidden">Siguiendo</span>
                    <span className="hidden group-hover:block">Dejar de seguir</span>
                  </Button>
                ) : (
                  <Button
                    className="gap-2 min-w-[148px] justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 glow-purple"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    <UserPlus className="h-4 w-4" /> Seguir
                  </Button>
                )}

                {user.isStreamer && user.liveStream && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90"
                    onClick={() => setView('streams')}
                  >
                    <Play className="h-4 w-4" /> Ver Stream
                  </Button>
                )}
              </div>
            </div>

            {/* NAME + BIO */}
            <div className="mt-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {user.displayName}
                </h1>
                {user.isStreamer && (
                  <Badge className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-pink-200 border-pink-500/40">
                    <Radio className="h-3 w-3 mr-1" /> STREAMER
                  </Badge>
                )}
                {user.frame && (
                  <Badge variant="outline" className="border-border/60 text-muted-foreground gap-1">
                    <Award className="h-3 w-3" style={{ color: user.frame.color }} />
                    {user.frame.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>

              {user.bio && (
                <p className="text-sm leading-relaxed pt-1 max-w-2xl">{user.bio}</p>
              )}

              {user.isStreamer && (
                <div className="flex flex-wrap items-center gap-3 pt-1.5 text-sm">
                  {user.platform && <PlatformBadge platform={user.platform} />}
                  {user.channelHandle && (
                    <span className="text-muted-foreground font-mono text-xs">
                      /{user.channelHandle}
                    </span>
                  )}
                </div>
              )}

              {user.liveStream && (
                <button
                  onClick={() => setView('streams')}
                  className="mt-2 flex w-full items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-left transition-colors hover:border-red-500/50 hover:bg-red-500/15"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-300">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-red-100">
                      {user.liveStream.title}
                    </p>
                    <p className="text-xs text-red-300/80 mt-0.5">
                      {categoryLabels[user.liveStream.category] || user.liveStream.category} ·{' '}
                      {formatCount(user.liveStream.viewers)} viendo ahora
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-300 shrink-0 self-center">
                    Ver →
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Se unió{' '}
                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                })}
              </div>
            </div>

            {/* LEVEL + XP */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Nivel {user.level}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {user.xp.toLocaleString('es-ES')} XP
                  </p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <Progress value={xpPct} className="h-2 bg-muted/50" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {xpPct}% hacia el nivel {user.level + 1} · {XP_MAX.toLocaleString('es-ES')} XP máx
                </p>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatCard
                label="Publicaciones"
                value={user.postsCount}
                icon={MessageCircle}
                color="purple"
                onClick={() => setActiveTab('posts')}
              />
              <StatCard
                label="Seguidores"
                value={followersCount}
                icon={Users}
                color="pink"
                onClick={() => setActiveTab('followers')}
              />
              <StatCard
                label="Siguiendo"
                value={user.followingCount}
                icon={UserCheck}
                color="cyan"
                onClick={() => setActiveTab('following')}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ============================ TABS ============================ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="bg-card/50 backdrop-blur border border-border/50">
          <TabsTrigger value="posts" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> Publicaciones
          </TabsTrigger>
          <TabsTrigger value="followers" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Seguidores
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> Siguiendo
          </TabsTrigger>
        </TabsList>

        {/* ----------------- POSTS TAB ----------------- */}
        <TabsContent value="posts" className="mt-4">
          {isSelf && (
            <Card className="border-border/50 bg-card/50 p-4 mb-4">
              <div className="flex items-start gap-3">
                <FrameAvatar
                  src={currentUser?.avatar ?? null}
                  fallback={currentUser?.displayName ?? 'YO'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <Textarea
                    placeholder="¿Qué estás jugando ahora?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[60px] resize-none bg-transparent border-border/40 focus-visible:border-primary/50"
                    maxLength={1000}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{newPost.length}/1000</span>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 glow-purple"
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || posting}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {posting ? 'Publicando…' : 'Publicar'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {posts.length === 0 ? (
            <Card className="border-border/50 bg-card/50 p-10 text-center grid-bg">
              <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-semibold">Sin publicaciones todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isSelf
                  ? '¡Comparte tu primera publicación!'
                  : 'Este usuario aún no ha publicado.'}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: Math.min(i * 0.04, 0.3), duration: 0.3 },
                  }}
                >
                  <Card className="border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors">
                    <div className="mb-3 flex items-center gap-3">
                      <button onClick={() => openProfile(p.author.id)} className="shrink-0">
                        <FrameAvatar
                          src={p.author.avatar}
                          fallback={p.author.displayName}
                          size="md"
                          ring={p.author.isStreamer}
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => openProfile(p.author.id)}
                            className="truncate text-sm font-semibold hover:text-primary"
                          >
                            {p.author.displayName}
                          </button>
                          {p.author.isStreamer && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[9px] bg-primary/15 text-primary"
                            >
                              STREAMER
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed">{p.content}</p>
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="mb-3 w-full max-h-96 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleLike(p.id)}
                        disabled={likingId === p.id}
                        className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                          p.liked
                            ? 'text-pink-400'
                            : 'text-muted-foreground hover:text-pink-400'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${p.liked ? 'fill-pink-500' : ''}`} />
                        {formatCount(p.likesCount)}
                      </button>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {formatCount(p.commentsCount)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ----------------- FOLLOWERS TAB ----------------- */}
        <TabsContent value="followers" className="mt-4">
          <CountCard
            count={followersCount}
            labelSingular="seguidor"
            labelPlural="seguidores"
            icon={Users}
            color="purple"
            selfNote={
              isSelf
                ? 'Tus seguidores aparecerán aquí muy pronto.'
                : `Personas que siguen a ${user.displayName}.`
            }
            emptyNote="Aún no tiene seguidores."
          />
        </TabsContent>

        {/* ----------------- FOLLOWING TAB ----------------- */}
        <TabsContent value="following" className="mt-4">
          <CountCard
            count={user.followingCount}
            labelSingular="cuenta seguida"
            labelPlural="cuentas seguidas"
            icon={UserCheck}
            color="cyan"
            selfNote={
              isSelf
                ? 'Las cuentas que sigues aparecerán aquí muy pronto.'
                : `${user.displayName} sigue a estas cuentas.`
            }
            emptyNote="Aún no sigue a nadie."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ============================ SUBCOMPONENTS ============================ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string
  value: number
  icon: any
  color: 'purple' | 'pink' | 'cyan'
  onClick?: () => void
}) {
  const colorClasses = {
    purple: 'hover:border-purple-500/40 hover:text-purple-300 hover:glow-purple',
    pink: 'hover:border-pink-500/40 hover:text-pink-300',
    cyan: 'hover:border-cyan-500/40 hover:text-cyan-300',
  }
  return (
    <button onClick={onClick} className="text-left">
      <Card
        className={`border-border/50 bg-card/40 p-3 text-center transition-all hover:bg-card/60 sm:p-4 ${colorClasses[color]}`}
      >
        <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide sm:text-[11px]">{label}</span>
        </div>
        <p className="text-lg font-extrabold sm:text-2xl">{formatCount(value)}</p>
      </Card>
    </button>
  )
}

function CountCard({
  count,
  labelSingular,
  labelPlural,
  icon: Icon,
  color,
  selfNote,
  emptyNote,
}: {
  count: number
  labelSingular: string
  labelPlural: string
  icon: any
  color: 'purple' | 'cyan'
  selfNote: string
  emptyNote: string
}) {
  const colorClasses = {
    purple: 'bg-purple-500/15 text-purple-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
  }
  return (
    <Card className="border-border/50 bg-card/50 p-10 text-center grid-bg">
      <div
        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${colorClasses[color]}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <p className="text-4xl font-extrabold gradient-text">{formatCount(count)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {count === 1 ? labelSingular : labelPlural}
      </p>
      <p className="mx-auto mt-4 max-w-sm text-xs text-muted-foreground">
        {count === 0 ? emptyNote : selfNote}
      </p>
    </Card>
  )
}
