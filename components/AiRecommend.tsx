'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Recommendation { title: string; author: string; reason: string }
interface AiRecommendProps {
  shelf: { status: string; rating: number | null; book: { title: string; authors: string[] } }[]
}

export default function AiRecommend({ shelf }: AiRecommendProps) {
  const [loading, setLoading] = useState(false)
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [insight, setInsight] = useState('')
  const [preference, setPreference] = useState('')
  const [error, setError] = useState('')

  const get = async () => {
    setLoading(true); setError(''); setRecs([])
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelf, preference }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setRecs(data.recommendations || [])
      setInsight(data.insight || '')
    } catch { setError('出了点问题，再试一次。') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: '#13131a', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 10, padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(192,132,252,0.05), transparent)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: '#c084fc' }}>✦</span>
        <h3 style={{ fontFamily: 'Noto Serif SC', fontSize: 18, color: '#e8e0f0' }}>AI 阅读推荐</h3>
      </div>
      <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', marginBottom: 16 }}>根据你的书架品味，推荐 3 本你可能喜欢的书。</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={preference} onChange={e => setPreference(e.target.value)} placeholder="可选偏好：更短的、更多悬疑……" className="input" style={{ flex: 1, fontSize: 13 }} />
        <button onClick={get} disabled={loading} className="btn-primary" style={{ fontSize: 13, whiteSpace: 'nowrap', padding: '10px 20px' }}>
          {loading ? '思考中…' : '推荐'}
        </button>
      </div>
      {error && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 64, background: '#1a1a24', borderRadius: 6 }} />)}
        </div>
      )}
      {recs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insight && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#c084fc', fontStyle: 'italic', marginBottom: 8 }}>✦ {insight}</p>}
          {recs.map((rec, i) => (
            <div key={i} style={{ background: '#1a1a24', border: '1px solid #252535', borderRadius: 6, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: 'Noto Serif SC', fontSize: 15, color: '#e8e0f0', marginBottom: 4 }}>{rec.title}</h4>
                <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0', marginBottom: 6 }}>{rec.author}</p>
                <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#3a3550', lineHeight: 1.7 }}>{rec.reason}</p>
              </div>
              <Link href={`/search?q=${encodeURIComponent(rec.title)}`} className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px', whiteSpace: 'nowrap' }}>搜索 →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
