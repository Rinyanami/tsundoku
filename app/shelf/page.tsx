'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import AiRecommend from '@/components/AiRecommend'
import type { GoogleBook } from '@/lib/books'
import Link from 'next/link'

const TABS = [
  { value: 'all', label: '全部', color: '#e8e0f0' },
  { value: 'reading', label: '在读', color: '#c084fc' },
  { value: 'want_to_read', label: '想读', color: '#7dd3fc' },
  { value: 'completed', label: '读完', color: '#6ee7a0' },
  { value: 'on_hold', label: '搁置', color: '#8a82a0' },
  { value: 'dropped', label: '抛弃', color: '#f87171' },
]

export default function ShelfPage() {
  const [entries, setEntries] = useState<{ status: string; rating: number | null; book: GoogleBook }[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)
  const [tab, setTab] = useState('all')
  const [showAI, setShowAI] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setLoading(false); return }
      setUser(u.id)
      const { data } = await supabase
        .from('shelf_items')
        .select('status, rating, books(id, title, authors, thumbnail, published_date, page_count, categories)')
        .eq('user_id', u.id)
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
  }, [])

  const filtered = tab === 'all' ? entries : entries.filter(e => e.status === tab)
  const counts = TABS.reduce((acc, t) => {
    acc[t.value] = t.value === 'all' ? entries.length : entries.filter(e => e.status === t.value).length
    return acc
  }, {} as Record<string, number>)

  if (!loading && !user) {
    return (
      <div style={{ maxWidth: 400, margin: '120px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: 24, color: '#c084fc' }}>読</span>
        </div>
        <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 24, color: '#e8e0f0', marginBottom: 10 }}>你的书架在等你</h1>
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', marginBottom: 28, lineHeight: 1.7 }}>登录后开始追踪你的阅读，建立你自己的书单</p>
        <Link href="/search" className="btn-primary" style={{ fontSize: 14 }}>先去搜书</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 32, color: '#e8e0f0', marginBottom: 6 }}>我的书架</h1>
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>共 {entries.length} 本</p>
        </div>
        <button onClick={() => setShowAI(!showAI)} className="btn-ghost" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#c084fc' }}>✦</span> AI 推荐
        </button>
      </div>

      {showAI && <div style={{ marginBottom: 32 }}><AiRecommend shelf={entries} /></div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #252535' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans SC', fontSize: 13, transition: 'color 0.2s', color: tab === t.value ? t.color : '#8a82a0', borderBottom: tab === t.value ? `2px solid ${t.color}` : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
            {counts[t.value] > 0 && <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.6 }}>{counts[t.value]}</span>}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 80, background: '#1a1a24', borderRadius: 6 }} />)}
        </div>
      )}

      {!loading && (
        filtered.length > 0 ? (
          <div style={{ border: '1px solid #252535', borderRadius: 8, overflow: 'hidden' }}>
            {filtered.map((entry, i) => (
              <div key={entry.book.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #252535' : 'none' }}>
                <BookCard book={entry.book} status={entry.status} rating={entry.rating ?? undefined} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'Noto Serif SC', fontSize: 20, color: '#8a82a0', marginBottom: 8 }}>
              {tab === 'all' ? '书架还是空的' : `没有「${TABS.find(t => t.value === tab)?.label}」的书`}
            </p>
            <Link href="/search" className="btn-primary" style={{ fontSize: 14, marginTop: 20, display: 'inline-block' }}>搜索书目</Link>
          </div>
        )
      )}
    </div>
  )
}
