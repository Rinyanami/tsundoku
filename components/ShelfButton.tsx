'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GoogleBook } from '@/lib/books'

const STATUSES = [
  { value: 'reading', label: '在读', color: '#c084fc' },
  { value: 'want_to_read', label: '想读', color: '#7dd3fc' },
  { value: 'completed', label: '读完', color: '#6ee7a0' },
  { value: 'on_hold', label: '搁置', color: '#8a82a0' },
  { value: 'dropped', label: '抛弃', color: '#f87171' },
]

export default function ShelfButton({ book }: { book: GoogleBook & { category?: string } }) {
  const [user, setUser] = useState<string | null>(null)
  const [shelfItem, setShelfItem] = useState<{ status: string; rating: number | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { setLoading(false); return }
      setUser(data.user.id)
      const { data: item } = await supabase.from('shelf_items').select('status, rating')
        .eq('user_id', data.user.id).eq('book_id', book.id).single()
      if (item) { setShelfItem(item); setRating(item.rating || 0) }
      setLoading(false)
    }
    init()
  }, [book.id])

  const ensureBookCached = async () => {
    await supabase.from('books').upsert({
      id: book.id, title: book.title, authors: book.authors,
      description: book.description, thumbnail: book.thumbnail,
      published_date: book.publishedDate, page_count: book.pageCount,
      categories: book.categories, category: book.category || 'other',
    }, { onConflict: 'id' })
  }

  const setStatus = async (status: string) => {
    if (!user) { setShowAuthPrompt(true); return }
    setLoading(true)
    await ensureBookCached()
    await supabase.from('shelf_items').upsert(
      { user_id: user, book_id: book.id, status, rating: rating || null },
      { onConflict: 'user_id,book_id' }
    )
    setShelfItem({ status, rating: rating || null })
    setOpen(false); setLoading(false)
  }

  const updateRating = async (n: number) => {
    if (!user || !shelfItem) return
    setRating(n)
    await supabase.from('shelf_items').update({ rating: n }).eq('user_id', user).eq('book_id', book.id)
    setShelfItem({ ...shelfItem, rating: n })
  }

  const remove = async () => {
    if (!user) return
    await supabase.from('shelf_items').delete().eq('user_id', user).eq('book_id', book.id)
    setShelfItem(null); setRating(0); setOpen(false)
  }

  if (loading) return <div style={{ height: 40, width: 140, background: '#1a1a24', borderRadius: 4 }} />

  const current = STATUSES.find(s => s.value === shelfItem?.status)

  const buttonStyle = shelfItem ? {
    padding: '8px 18px', borderRadius: 4, fontSize: 13, fontFamily: 'Noto Sans SC', fontWeight: 500,
    background: `${current?.color}18`, border: `1px solid ${current?.color}40`,
    color: current?.color, cursor: 'pointer', transition: 'all 0.2s',
  } : {
    padding: '10px 20px', borderRadius: 4, fontSize: 14, fontFamily: 'Noto Sans SC', fontWeight: 500,
    background: 'linear-gradient(135deg, #c084fc, #a855f7)', color: '#0d0d12',
    border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(192,132,252,0.3)',
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={buttonStyle}>
        {shelfItem ? `${current?.label} ▾` : '+ 加入书架'}
      </button>

      {showAuthPrompt && <p style={{ marginTop: 8, fontSize: 12, color: '#8a82a0', fontFamily: 'Noto Sans SC' }}>请先登录再添加</p>}

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 48, background: '#1a1a24', border: '1px solid #252535', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 40, width: 200, padding: '6px 0' }}>
            <p style={{ padding: '6px 14px', fontSize: 10, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', borderBottom: '1px solid #252535', marginBottom: 4 }}>设置状态</p>
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setStatus(s.value)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans SC', fontSize: 13, color: shelfItem?.status === s.value ? s.color : '#8a82a0' }}
                className="hover:bg-elevated">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'block', flexShrink: 0 }} />
                {s.label}
              </button>
            ))}

            {shelfItem && (
              <div style={{ borderTop: '1px solid #252535', marginTop: 4, padding: '10px 14px' }}>
                <p style={{ fontSize: 10, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', marginBottom: 8 }}>评分</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => updateRating(n)}
                      style={{ width: 28, height: 28, fontSize: 11, fontFamily: 'Noto Sans SC', borderRadius: 4, border: 'none', cursor: 'pointer', background: rating === n ? '#f0b860' : '#252535', color: rating === n ? '#0d0d12' : '#8a82a0', fontWeight: rating === n ? 600 : 400 }}>
                      {n}
                    </button>
                  ))}
                </div>
                <button onClick={remove} style={{ marginTop: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC', textAlign: 'left', padding: '4px 0' }}>
                  从书架移除
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
