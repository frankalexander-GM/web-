import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const streamers = await db.user.findMany({
    where: { isStreamer: true },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      banner: true,
      bio: true,
      platform: true,
      channelHandle: true,
      level: true,
    },
    orderBy: { level: 'desc' },
  })

  const result = await Promise.all(
    streamers.map(async (s) => {
      const followersCount = await db.follow.count({ where: { followingId: s.id } })
      const isLive = await db.stream.findFirst({
        where: { streamerId: s.id, isLive: true },
        select: { id: true, viewers: true, title: true, category: true },
      })
      return { ...s, followersCount, isLive: isLive ? { viewers: isLive.viewers, title: isLive.title, category: isLive.category } : null }
    })
  )

  return NextResponse.json({ streamers: result })
}
