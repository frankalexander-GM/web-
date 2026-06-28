import { db } from '@/lib/db'

/**
 * Servicio de publicaciones: lógica de negocio para posts y likes.
 */
export class PostService {
  /** Lista publicaciones (opcionalmente filtradas por autor) con estado de like. */
  static async list(authorId?: string) {
    const where = authorId ? { authorId } : {}
    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true, isStreamer: true } },
      },
    })

    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser || posts.length === 0) return posts.map((p) => ({ ...p, liked: false }))

    // Una sola consulta para todos los likes del usuario (evita N+1)
    const likes = await db.like.findMany({
      where: { userId: currentUser.id, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    })
    const likedSet = new Set(likes.map((l) => l.postId))
    return posts.map((p) => ({ ...p, liked: likedSet.has(p.id) }))
  }

  /** Crea una publicación del usuario actual. */
  static async create(content: string, image?: string | null) {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')
    const trimmed = content.trim()
    if (!trimmed) throw new Error('El contenido es obligatorio')

    return db.post.create({
      data: { authorId: currentUser.id, content: trimmed.slice(0, 1000), image: image || null },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true, isStreamer: true } },
      },
    })
  }

  /** Toggle like en una publicación. */
  static async toggleLike(postId: string) {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')

    const post = await db.post.findUnique({ where: { id: postId } })
    if (!post) throw new Error('Publicación no encontrada')

    const existing = await db.like.findUnique({
      where: { userId_postId: { userId: currentUser.id, postId } },
    })

    if (existing) {
      await db.$transaction([
        db.like.delete({ where: { userId_postId: { userId: currentUser.id, postId } } }),
        db.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
      ])
      return { liked: false, likesCount: Math.max(0, post.likesCount - 1) }
    }

    await db.$transaction([
      db.like.create({ data: { userId: currentUser.id, postId } }),
      db.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
    ])
    return { liked: true, likesCount: post.likesCount + 1 }
  }
}
