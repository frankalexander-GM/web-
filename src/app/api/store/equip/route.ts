import { NextRequest, NextResponse } from 'next/server'
import { StoreService } from '@/lib/services'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  try {
    const result = await StoreService.equipFrame(body.itemId ?? null)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
