import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await UserService.getProfile(id)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}
