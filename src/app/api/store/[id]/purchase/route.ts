import { NextRequest, NextResponse } from 'next/server'
import { StoreService } from '@/lib/services'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await StoreService.purchase(id)
    return NextResponse.json(result)
  } catch (e: any) {
    const status = e.message.includes('suficientes') ? 400 : 404
    return NextResponse.json({ error: e.message }, { status })
  }
}
