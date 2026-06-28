import { db } from '@/lib/db'

/**
 * Servicio de tienda: lógica de negocio para listar, comprar y equipar artículos.
 */
export class StoreService {
  /** Lista artículos con filtros y marca los que ya posee el usuario actual. */
  static async listItems(type?: string, rarity?: string) {
    const where: any = {}
    if (type && type !== 'all') where.type = type
    if (rarity && rarity !== 'all') where.rarity = rarity

    const items = await db.storeItem.findMany({ where, orderBy: { sales: 'desc' } })
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) return items.map((i) => ({ ...i, owned: false }))

    const purchases = await db.purchase.findMany({
      where: { userId: currentUser.id },
      select: { itemId: true },
    })
    const ownedSet = new Set(purchases.map((p) => p.itemId))
    return items.map((i) => ({ ...i, owned: ownedSet.has(i.id) }))
  }

  /** Compra un artículo (valida coins y propiedad). */
  static async purchase(itemId: string) {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')

    const item = await db.storeItem.findUnique({ where: { id: itemId } })
    if (!item) throw new Error('Artículo no encontrado')

    const existing = await db.purchase.findUnique({
      where: { userId_itemId: { userId: currentUser.id, itemId } },
    })
    if (existing) throw new Error('Ya posees este artículo')

    if (currentUser.coins < item.price) {
      throw new Error('No tienes suficientes coins')
    }

    await db.$transaction([
      db.purchase.create({ data: { userId: currentUser.id, itemId } }),
      db.user.update({ where: { id: currentUser.id }, data: { coins: { decrement: item.price } } }),
      db.storeItem.update({ where: { id: itemId }, data: { sales: { increment: 1 } } }),
    ])

    const updated = await db.user.findUnique({ where: { id: currentUser.id }, select: { coins: true } })
    return { success: true, coins: updated?.coins ?? 0 }
  }

  /** Equipa o quita el marco de perfil. */
  static async equipFrame(itemId: string | null) {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) throw new Error('Usuario no encontrado')

    if (!itemId) {
      await db.user.update({ where: { id: currentUser.id }, data: { frameId: null } })
      return { success: true, frameId: null }
    }

    const item = await db.storeItem.findUnique({ where: { id: itemId } })
    if (!item || item.type !== 'frame') throw new Error('Marco no válido')

    const owned = await db.purchase.findUnique({
      where: { userId_itemId: { userId: currentUser.id, itemId } },
    })
    if (!owned) throw new Error('No posees este marco')

    await db.user.update({ where: { id: currentUser.id }, data: { frameId: itemId } })
    return { success: true, frameId: itemId, frameColor: item.color }
  }

  /** Artículos comprados por el usuario actual. */
  static async myItems() {
    const currentUser = await db.user.findUnique({ where: { username: 'tu' } })
    if (!currentUser) return { items: [], equippedFrameId: null, coins: 0 }

    const purchases = await db.purchase.findMany({
      where: { userId: currentUser.id },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    })
    return {
      items: purchases.map((p) => p.item),
      equippedFrameId: currentUser.frameId,
      coins: currentUser.coins,
    }
  }
}
