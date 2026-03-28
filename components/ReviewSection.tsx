'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string; rating: number | null; content: string | null
  created_at: string; user_id: string; profiles: { username: string | null } | null
}

export default function ReviewSection({ bookId }: { bookId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) setUser(u.id)
      const res = await fetch(`/api/reviews?book_id=${bookId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      if (u) {
        const found = (data.reviews || []).find((r: Review) => r.user_id === u.id)
        if (found) { setMyReview(found); setRating(found.rating || 0); setContent(found.content || '') }
      }
      setLoading(false)
    }
    init()
  }, [bookId])

  const submit = async () => {
    if (!user) return
    setSubmitting(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, rating: rating || null, content: content || null }),
    })
    if (res.ok) {
      setShowForm(false)
      const res2 = await fetch(`/api/reviews?book_id=${bookId}`)
      const data2 = await res2.json()
      setReviews(data2.reviews || [])
      const found = data2.reviews.find((r: Review) => r.user_id === user)
      if (found) setMyReview(found)
    }
    setSubmitting(false)
  }

  const fmt = (str: string) => { const d = new Date(str); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}` }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          短评 {reviews.length > 0 && `· ${reviews.length}`}
        </p>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }}>
            {myReview ? '编辑评论' : '+ 写短评'}
          </button>
        )}
        {!user && <span style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC' }}>登录后可写短评</span>}
      </div>

      {showForm && (
        <div style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', marginBottom: 10 }}>我的评分</p>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setRating(n)}
                style={{ width: 32, height: 32, borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Noto Sans SC', fontSize: 12, background: rating === n ? '#f0b860' : '#252535', color: rating === n ? '#0d0d12' : '#8a82a0', fontWeight: rating === n ? 600 : 400 }}>
                {n}
              </button>
            ))}
            {rating > 0 && <button onClick={() => setRating(0)} style={{ fontSize: 11, color: '#3a3550', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans SC', padding: '0 8px' }}>清除</button>}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="写几句你的想法……（选填）" rows={3}
            style={{ width: '100%', padding: '10px 12px', background: '#1a1a24', border: '1px solid #252535', borderRadius: 4, fontSize: 13, color: '#e8e0f0', fontFamily: 'Noto Sans SC', resize: 'none', outline: 'none', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ fontSize: 13 }}>取消</button>
            <button onClick={submit} disabled={submitting || (!rating && !content)} className="btn-primary" style={{ fontSize: 13 }}>
              {submitting ? '发布中…' : '发布'}
            </button>
          </div>
        </div>
      )}

      {loading && <div style={{ height: 80, background: '#1a1a24', borderRadius: 6 }} />}

      {!loading && reviews.length === 0 && (
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#3a3550', padding: '20px 0' }}>还没有短评，来写第一条吧。</p>
      )}

      {!loading && reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {reviews.map((r, i) => (
            <div key={r.id} style={{ padding: '16px 0', borderBottom: i < reviews.length - 1 ? '1px solid #1a1a24' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a24', border: '1px solid #252535', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, color: '#8a82a0', fontFamily: 'Noto Sans SC' }}>{r.profiles?.username?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <span style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>{r.profiles?.username || '匿名用户'}</span>
                {r.rating && <span style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#f0b860', fontWeight: 500 }}>★ {r.rating}/10</span>}
                <span style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', marginLeft: 'auto' }}>{fmt(r.created_at)}</span>
              </div>
              {r.content && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', lineHeight: 1.8, paddingLeft: 38 }}>{r.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
