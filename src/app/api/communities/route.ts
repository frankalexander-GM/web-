import { NextResponse } from 'next/server'
import { CommunityService } from '@/lib/services'

export async function GET() {
  const communities = await CommunityService.listAll()
  return NextResponse.json({ communities })
}
