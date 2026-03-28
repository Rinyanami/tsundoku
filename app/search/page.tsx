'use client'

import { useState, useCallback } from 'react'
import { BookGridCard } from '@/components/BookCard'
import ManualAddModal from '@/components/ManualAddModal'
import type { GoogleBook } from '@/lib/books'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showManual, setShowManual] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.books || [])
    } catch { setResults([]) }
    setLoading(false)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 32, color: '#e8e0f0', marginBottom: 6 }}>搜索书目</h1>
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>支持中文、日文、英文 · Google Books + Open Library 双源</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, maxWidth: 600 }}>
        <input type="text" placeholder="书名、作者……"
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          className="input" style={{ flex: 1, fontSize: 15 }} autoFocus />
        <button onClick={() => search(query)} disabled={loading || !query.trim()} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, whiteSpace: 'nowrap' }}>
          {loading ? '…' : '搜索'}
        </button>
      </div>

      <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#3a3550', marginBottom: 40 }}>
        搜不到？
        <button onClick={() => setShowManual(true)} style={{ color: '#c084fc', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans SC', fontSize: 12, marginLeft: 4 }}>
          手动添加 →
        </button>
      </p>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div style={{ aspectRatio: '2/3', background: '#1a1a24', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, background: '#1a1a24', borderRadius: 4, marginBottom: 6, width: '75%' }} />
              <div style={{ height: 12, background: '#1a1a24', borderRadius: 4, width: '50%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && (
        results.length > 0 ? (
          <>
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', marginBottom: 20 }}>
              找到 {results.length} 条结果
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map(book => <BookGridCard key={book.id} book={book} />)}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'Noto Serif SC', fontSize: 20, color: '#8a82a0', marginBottom: 8 }}>没有找到结果</p>
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#3a3550', marginBottom: 24 }}>换个关键词，或者手动添加这本书</p>
            <button onClick={() => setShowManual(true)} className="btn-primary" style={{ fontSize: 14 }}>手动添加书目</button>
          </div>
        )
      )}

      {!loading && !searched && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#3a3550' }}>
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13 }}>输入书名或作者开始搜索</p>
        </div>
      )}

      {showManual && <ManualAddModal onClose={() => setShowManual(false)} />}
    </div>
  )
}
