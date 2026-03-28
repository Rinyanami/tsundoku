'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookGridCard } from '@/components/BookCard'
import type { GoogleBook } from '@/lib/books'
import Link from 'next/link'
import { Suspense } from 'react'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'webnovel', label: '网络小说' },
  { key: 'lightnovel', label: '轻小说' },
  { key: 'literature', label: '文学' },
  { key: 'manga', label: '漫画' },
  { key: 'other', label: '其他' },
]

const POPULAR_QUERIES: Record<string, string[]> = {
  webnovel: ['斗罗大陆', '遮天', '完美世界', '诡秘之主', '凡人修仙传'],
  lightnovel: ['sword art online', '魔法科高中的劣等生', '你的名字', '凉宫春日', '狼与香辛料'],
  literature: ['百年孤独', '三体', '活着', '围城', '红楼梦'],
  manga: ['one piece', 'naruto', '进击的巨人', '鬼灭之刃', '咒术回战'],
  all: ['bestseller fiction', 'classic literature', 'mystery thriller', 'science fiction'],
}

function BrowseContent() {
  const searchParams = useSearchParams()
  const initCat = searchParams.get('category') || 'all'
  const [category, setCategory] = useState(initCat)
  const [books, setBooks] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [tag, setTag] = useState('')

  const fetchBooks = async (cat: string) => {
    setLoading(true)
    const queries = POPULAR_QUERIES[cat] || POPULAR_QUERIES['all']
    const q = queries[Math.floor(Math.random() * queries.length)]
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch { setBooks([]) }
    setLoading(false)
  }

  useEffect(() => { fetchBooks(category) }, [category])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 32, color: '#e8e0f0', marginBottom: 6 }}>分类浏览</h1>
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>按分类探索书目，搜不到的可以手动添加</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid #252535', paddingBottom: 0 }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)}
            style={{
              padding: '8px 16px', fontFamily: 'Noto Sans SC', fontSize: 13, background: 'none', border: 'none',
              cursor: 'pointer', transition: 'color 0.2s', position: 'relative',
              color: category === cat.key ? '#c084fc' : '#8a82a0',
              borderBottom: category === cat.key ? '2px solid #c084fc' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ animation: 'pulse 2s infinite' }}>
              <div style={{ aspectRatio: '2/3', background: '#1a1a24', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, background: '#1a1a24', borderRadius: 4, marginBottom: 6, width: '75%' }} />
              <div style={{ height: 12, background: '#1a1a24', borderRadius: 4, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}
            className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books.map(book => <BookGridCard key={book.id} book={book} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => fetchBooks(category)} className="btn-ghost" style={{ fontSize: 13 }}>
              换一批 →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-12"><p style={{ color: '#8a82a0', fontFamily: 'Noto Sans SC' }}>加载中…</p></div>}>
      <BrowseContent />
    </Suspense>
  )
}
