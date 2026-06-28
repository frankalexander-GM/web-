import { NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function GET() {
  const user = await UserService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}
