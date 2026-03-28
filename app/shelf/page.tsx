'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BookCard from '@/components/BookCard'
import AiRecommend from '@/components/AiRecommend'
import type { GoogleBook } from '@/lib/books'
import Link from 'next/link'

type Status = 'all' | 'reading' | 'want_to_read' | 'completed' | 'on_hold' | 'dropped'

const TABS: { value: Status; label: string; jp: string }[] = [
  { value: 'all', label: 'All', jp: '全部' },
  { value: 'reading', label: 'Reading', jp: '在读' },
  { value: 'want_to_read', label: 'Want to Read', jp: '想读' },
  { value: 'completed', label: 'Completed', jp: '读完' },
  { value: 'on_hold', label: 'On Hold', jp: '搁置' },
  { value: 'dropped', label: 'Dropped', jp: '抛弃' },
]

interface ShelfEntry {
  status: string
  rating: number | null
  book: GoogleBook
}

export default function ShelfPage() {
  const [entries, setEntries] = useState<ShelfEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)
  const [tab, setTab] = useState<Status>('all')
  const [showAI, setShowAI] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setLoading(false); return }
      setUser(u.id)

      const { data } = await supabase
        .from('shelf_items')
        .select(`status, rating, books(id, title, authors, thumbnail, published_date, page_count, categories)`)
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
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="font-display text-4xl text-text mb-3">Your shelf awaits</p>
        <p className="font-body text-sm text-muted mb-8">Sign in to start tracking your reading</p>
        <Link href="/search" className="btn-primary">Browse books first</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">My Shelf</h1>
          <p className="font-body text-sm text-muted">{entries.length} books tracked</p>
        </div>
        <button onClick={() => setShowAI(!showAI)} className="btn-ghost text-sm flex items-center gap-2">
          <span>✦</span> AI Recommend
        </button>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className="mb-8">
          <AiRecommend shelf={entries} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 flex-wrap border-b border-border pb-px">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 font-body text-sm transition-colors relative ${
              tab === t.value
                ? 'text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-accent'
                : 'text-muted hover:text-text'
            }`}
          >
            {t.label}
            {counts[t.value] > 0 && (
              <span className="ml-1.5 text-xs text-faint">{counts[t.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-elevated rounded-sm animate-pulse" />
          ))}
        </div>
      )}

      {/* Entries */}
      {!loading && (
        <>
          {filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map(entry => (
                <BookCard
                  key={entry.book.id}
                  book={entry.book}
                  status={entry.status}
                  rating={entry.rating ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-muted mb-2">
                {tab === 'all' ? 'Your shelf is empty' : `No ${tab.replace('_', ' ')} books`}
              </p>
              <p className="font-body text-sm text-faint mb-6">
                {tab === 'all' ? 'Search for a book to add it' : 'Change status on a book to see it here'}
              </p>
              <Link href="/search" className="btn-primary">Find books</Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
