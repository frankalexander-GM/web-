import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/lib/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const authorId = searchParams.get('authorId') ?? undefined
  const posts = await PostService.list(authorId)
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  try {
    const post = await PostService.create(body.content ?? '', body.image)
    return NextResponse.json({ post: { ...post, liked: false } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
