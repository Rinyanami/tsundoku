'use client'

import { useState, useCallback } from 'react'
import { BookGridCard } from '@/components/BookCard'
import type { GoogleBook } from '@/lib/books'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GoogleBook[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)

    const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data.books || [])
    setLoading(false)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search(query)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl text-text mb-2">Search Books</h1>
        <p className="font-body text-sm text-muted">Find any book and add it to your shelf</p>
      </div>

      {/* Search input */}
      <div className="flex gap-3 mb-12 max-w-2xl">
        <input
          type="text"
          placeholder="Title, author, ISBN..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input flex-1 text-base"
          autoFocus
        />
        <button
          onClick={() => search(query)}
          disabled={loading || !query.trim()}
          className="btn-primary px-6"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-elevated rounded-sm mb-2" />
              <div className="h-3 bg-elevated rounded-sm mb-1 w-3/4" />
              <div className="h-3 bg-elevated rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          {results.length > 0 ? (
            <>
              <p className="font-body text-xs text-faint uppercase tracking-widest mb-6">
                {results.length} results
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.map(book => (
                  <BookGridCard key={book.id} book={book} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-muted mb-2">No results</p>
              <p className="font-body text-sm text-faint">Try a different title or author</p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="text-center py-16 text-faint">
          <p className="font-display text-5xl mb-4">🔍</p>
          <p className="font-body text-sm">Search for a book to get started</p>
        </div>
      )}
    </div>
  )
}
