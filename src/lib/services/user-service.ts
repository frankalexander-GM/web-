import { db } from '@/lib/db'

/**
 * Servicio de usuarios: lógica de negocio para perfiles, follows, stats.
 */
export class UserService {
  /** El usuario "actual" simulado (username 'tu'). */
  static async getCurrentUser() {
    const user = await db.user.findUnique({
      where: { username: 'tu' },
      select: {
        id: true, username: true, displayName: true, avatar: true,
        banner: true, bio: true, isStreamer: true, platform: true,
        channelHandle: true, level: true, xp: true, coins: true, frameId: true,
      },
    })
    if (!user) return null
    const [followersCount, followingCount] = await Promise.all([
      db.follow.count({ where: { followingId: user.id } }),
      db.follow.count({ where: { followerId: user.id } }),
    ])
    return { ...user, followersCount, followingCount }
  }

  /** Obtiene el perfil completo de un usuario (vista pública). */
  static async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, displayName: true, avatar: true, banner: true,
        bio: true, isStreamer: true, platform: true, channelHandle: true,
        level: true, xp: true, frameId: true, createdAt: true,
      },
    })
    if (!user) return null

    // Una sola consulta agregada en paralelo (evita N+1)
    const [followersCount, followingCount, postsCount, liveStream, frame] = await Promise.all([
      db.follow.count({ where: { followingId: userId } }),
      db.follow.count({ where: { followerId: userId } }),
      db.post.count({ where: { authorId: userId } }),
      db.stream.findFirst({
        where: { streamerId: userId, isLive: true },
        select: { id: true, viewers: true, title: true, category: true, platform: true, channel: true },
      }),
      user.frameId
        ? db.storeItem.findUnique({ where: { id: user.frameId }, select: { id: true, name: true, color: true, rarity: true } })
        : Promise.resolve(null),
    ])

    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    const isFollowing = currentUser
      ? !!(await db.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: userId } } }))
      : false

    return {
      ...user,
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
      isSelf: currentUser?.id === userId,
      liveStream,
      frame,
    }
  }

  /** Toggle follow entre el usuario actual y otro. */
  static async toggleFollow(targetId: string) {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')
    if (currentUser.id === targetId) throw new Error('No puedes seguirte a ti mismo')

    const target = await db.user.findUnique({ where: { id: targetId } })
    if (!target) throw new Error('Usuario no encontrado')

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: targetId } },
    })

    if (existing) {
      await db.follow.delete({ where: { followerId_followingId: { followerId: currentUser.id, followingId: targetId } } })
      return { following: false, followersCount: await db.follow.count({ where: { followingId: targetId } }) }
    }

    await db.follow.create({ data: { followerId: currentUser.id, followingId: targetId } })
    return { following: true, followersCount: await db.follow.count({ where: { followingId: targetId } }) }
  }
}
