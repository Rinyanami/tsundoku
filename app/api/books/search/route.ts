import { NextResponse } from 'next/server'
import { searchBooks } from '@/lib/books'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ books: [] })
  }

  const books = await searchBooks(q, 20)
  return NextResponse.json({ books })
}
