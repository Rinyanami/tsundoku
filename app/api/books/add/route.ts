import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const body = await request.json()
  const { title, authors, description, thumbnail, publishedDate, pageCount, categories } = body
  if (!title) return NextResponse.json({ error: '书名不能为空' }, { status: 400 })

  const id = 'manual_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  const { data, error } = await supabase.from('books').insert({
    id, title,
    authors: authors || [],
    description: description || '',
    thumbnail: thumbnail || '',
    published_date: publishedDate || '',
    page_count: pageCount || 0,
    categories: categories || [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ book: data })
}
