import { db } from '@/lib/db'

/**
 * Servicio de comunidades: lógica de negocio para listar/unirse/salir.
 */
export class CommunityService {
  /** Lista todas las comunidades con el estado de membresía del usuario actual. */
  static async listAll() {
    const communities = await db.community.findMany({ orderBy: { membersCount: 'desc' } })
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) return communities.map((c) => ({ ...c, joined: false }))

    // Una sola consulta para todas las membresías del usuario (evita N+1)
    const memberships = await db.communityMember.findMany({
      where: { userId: currentUser.id },
      select: { communityId: true },
    })
    const joinedSet = new Set(memberships.map((m) => m.communityId))
    return communities.map((c) => ({ ...c, joined: joinedSet.has(c.id) }))
  }

  /** Une o saca al usuario actual de una comunidad por slug. */
  static async toggleMembership(slug: string, action: 'join' | 'leave') {
    const community = await db.community.findUnique({ where: { slug } })
    if (!community) throw new Error('Comunidad no encontrada')

    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')

    const existing = await db.communityMember.findUnique({
      where: { userId_communityId: { userId: currentUser.id, communityId: community.id } },
    })

    if (action === 'join' && !existing) {
      await db.communityMember.create({ data: { userId: currentUser.id, communityId: community.id } })
      await db.community.update({ where: { id: community.id }, data: { membersCount: { increment: 1 } } })
      return { joined: true, membersCount: community.membersCount + 1 }
    }

    if (action === 'leave' && existing) {
      await db.communityMember.delete({
        where: { userId_communityId: { userId: currentUser.id, communityId: community.id } },
      })
      await db.community.update({ where: { id: community.id }, data: { membersCount: { decrement: 1 } } })
      return { joined: false, membersCount: Math.max(0, community.membersCount - 1) }
    }

    return { joined: !!existing, membersCount: community.membersCount }
  }
}
