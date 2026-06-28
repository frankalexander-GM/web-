import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const streams = await db.stream.findMany({
    where: { isLive: true },
    orderBy: { viewers: 'desc' },
    include: {
      streamer: {
        select: { id: true, username: true, displayName: true, avatar: true, platform: true, channelHandle: true },
      },
    },
  })

  return NextResponse.json({ streams })
}
