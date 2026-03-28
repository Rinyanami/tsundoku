'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import type { GoogleBook } from '@/lib/books'
import Link from 'next/link'

const STATUS_CONFIG = [
  { key: 'reading', label: '在读', color: '#c084fc' },
  { key: 'completed', label: '读完', color: '#6ee7a0' },
  { key: 'want_to_read', label: '想读', color: '#7dd3fc' },
  { key: 'on_hold', label: '搁置', color: '#8a82a0' },
  { key: 'dropped', label: '抛弃', color: '#f87171' },
]

export default function UserPage({ params }: { params: { id: string } }) {
  const [entries, setEntries] = useState<{ status: string; rating: number | null; book: GoogleBook }[]>([])
  const [loading, setLoading] = useState(true)
  const [isMe, setIsMe] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id === params.id) setIsMe(true)

      const { data } = await supabase
        .from('shelf_items')
        .select('status, rating, books(id, title, authors, thumbnail, published_date, page_count, categories)')
        .eq('user_id', params.id)
        .order('updated_at', { ascending: false })

      if (data) {
        setEntries(data.map((row: Record<string, unknown>) => ({
          status: row.status as string,
          rating: row.rating as number | null,
          book: row.books as unknown as GoogleBook,
        })))
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const counts = STATUS_CONFIG.reduce((acc, s) => {
    acc[s.key] = entries.filter(e => e.status === s.key).length
    return acc
  }, {} as Record<string, number>)

  const avgRating = entries.filter(e => e.rating).length > 0
    ? (entries.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / entries.filter(e => e.rating).length).toFixed(1)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(124,58,237,0.2))', border: '2px solid rgba(192,132,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(192,132,252,0.15)' }}>
          <span style={{ fontSize: 24, color: '#c084fc', fontFamily: 'Noto Serif SC' }}>読</span>
        </div>
        <div>
          <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 24, color: '#e8e0f0', marginBottom: 4 }}>
            {isMe ? '我的主页' : '用户主页'}
          </h1>
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>
            共 {entries.length} 本书 {avgRating && `· 平均评分 ${avgRating}`}
          </p>
        </div>
        {isMe && (
          <Link href="/shelf" className="btn-ghost ml-auto" style={{ fontSize: 13 }}>管理书架</Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 40 }}>
        {STATUS_CONFIG.map(s => (
          <div key={s.key} style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 8, padding: '16px 12px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Noto Serif SC', fontSize: 28, color: s.color, marginBottom: 4, fontWeight: 300 }}>
              {counts[s.key]}
            </p>
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#8a82a0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      {!loading && entries.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 18, color: '#e8e0f0', marginBottom: 16 }}>最近更新</h2>
          <div style={{ border: '1px solid #252535', borderRadius: 8, overflow: 'hidden' }}>
            {entries.slice(0, 10).map(entry => (
              <div key={entry.book.id} style={{ borderBottom: '1px solid #252535' }}>
                <BookCard book={entry.book} status={entry.status} rating={entry.rating ?? undefined} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: 'Noto Serif SC', fontSize: 20, color: '#8a82a0', marginBottom: 8 }}>书架还是空的</p>
          {isMe && <Link href="/search" className="btn-primary" style={{ fontSize: 14 }}>去搜书</Link>}
        </div>
      )}
    </div>
  )
}
