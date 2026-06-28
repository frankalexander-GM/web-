import { NextResponse } from 'next/server'
import { StoreService } from '@/lib/services'

export async function GET() {
  return NextResponse.json(await StoreService.myItems())
}
