import { NextRequest, NextResponse } from 'next/server'
import { CommunityService } from '@/lib/services'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await req.json().catch(() => ({}))
  const action = body.action as 'join' | 'leave' | undefined
  try {
    const result = await CommunityService.toggleMembership(slug, action || 'join')
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
