'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Recommendation {
  title: string
  author: string
  reason: string
}

interface AiRecommendProps {
  shelf: { status: string; rating: number | null; book: { title: string; authors: string[] } }[]
}

export default function AiRecommend({ shelf }: AiRecommendProps) {
  const [loading, setLoading] = useState(false)
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [insight, setInsight] = useState('')
  const [preference, setPreference] = useState('')
  const [error, setError] = useState('')

  const getRecommendations = async () => {
    setLoading(true)
    setError('')
    setRecs([])

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shelf, preference }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setRecs(data.recommendations || [])
      setInsight(data.insight || '')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border rounded-sm p-6 bg-surface">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent text-sm">✦</span>
        <h3 className="font-display text-xl text-text">AI Reading Recommendation</h3>
      </div>

      <p className="font-body text-sm text-muted mb-4">
        Based on your shelf, the AI will suggest 3 books you might love.
      </p>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Optional: 'something shorter' or 'more sci-fi'..."
          value={preference}
          onChange={e => setPreference(e.target.value)}
          className="input flex-1 text-sm"
        />
        <button
          onClick={getRecommendations}
          disabled={loading}
          className="btn-primary text-sm px-5 whitespace-nowrap"
        >
          {loading ? 'Thinking...' : 'Recommend'}
        </button>
      </div>

      {error && (
        <p className="font-body text-sm text-red-400 mb-4">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-elevated rounded-sm animate-pulse" />
          ))}
        </div>
      )}

      {recs.length > 0 && (
        <div className="space-y-3">
          {insight && (
            <p className="font-body text-xs text-accent italic mb-4">
              ✦ {insight}
            </p>
          )}
          {recs.map((rec, i) => (
            <div key={i} className="p-4 bg-elevated rounded-sm border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-display text-base text-text">{rec.title}</h4>
                  <p className="font-body text-xs text-muted mb-2">{rec.author}</p>
                  <p className="font-body text-xs text-faint leading-relaxed">{rec.reason}</p>
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(rec.title + ' ' + rec.author)}`}
                  className="btn-ghost text-xs whitespace-nowrap"
                >
                  Find →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
