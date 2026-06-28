import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Historial de chat (backup, el socket service también lo envía)
export async function GET() {
  const messages = await db.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 40,
  })
  return NextResponse.json({ messages: messages.reverse() })
}
