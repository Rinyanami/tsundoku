import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('book_id')
  if (!bookId) return NextResponse.json({ reviews: [] })

  const supabase = createClient()
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at, user_id, profiles(username)')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ reviews: data || [] })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { book_id, rating, content } = await request.json()
  if (!book_id) return NextResponse.json({ error: '缺少书目 ID' }, { status: 400 })

  const { data, error } = await supabase.from('reviews').upsert(
    { user_id: user.id, book_id, rating, content },
    { onConflict: 'user_id,book_id' }
  ).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data })
}
