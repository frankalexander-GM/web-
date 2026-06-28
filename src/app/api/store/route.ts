import { NextRequest, NextResponse } from 'next/server'
import { StoreService } from '@/lib/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? undefined
  const rarity = searchParams.get('rarity') ?? undefined
  const items = await StoreService.listItems(type, rarity)
  return NextResponse.json({ items })
}
