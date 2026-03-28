'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GoogleBook } from '@/lib/books'

const STATUSES = [
  { value: 'want_to_read', label: '想读', en: 'Want to Read' },
  { value: 'reading', label: '在读', en: 'Reading' },
  { value: 'completed', label: '读完', en: 'Completed' },
  { value: 'on_hold', label: '搁置', en: 'On Hold' },
  { value: 'dropped', label: '抛弃', en: 'Dropped' },
]

interface ShelfButtonProps {
  book: GoogleBook
}

export default function ShelfButton({ book }: ShelfButtonProps) {
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

      const { data: item } = await supabase
        .from('shelf_items')
        .select('status, rating')
        .eq('user_id', data.user.id)
        .eq('book_id', book.id)
        .single()

      if (item) {
        setShelfItem(item)
        setRating(item.rating || 0)
      }
      setLoading(false)
    }
    init()
  }, [book.id])

  const ensureBookCached = async () => {
    await supabase.from('books').upsert({
      id: book.id,
      title: book.title,
      authors: book.authors,
      description: book.description,
      thumbnail: book.thumbnail,
      published_date: book.publishedDate,
      page_count: book.pageCount,
      categories: book.categories,
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
    setOpen(false)
    setLoading(false)
  }

  const updateRating = async (newRating: number) => {
    if (!user || !shelfItem) return
    setRating(newRating)
    await supabase.from('shelf_items')
      .update({ rating: newRating })
      .eq('user_id', user)
      .eq('book_id', book.id)
    setShelfItem({ ...shelfItem, rating: newRating })
  }

  const removeFromShelf = async () => {
    if (!user) return
    await supabase.from('shelf_items')
      .delete()
      .eq('user_id', user)
      .eq('book_id', book.id)
    setShelfItem(null)
    setRating(0)
    setOpen(false)
  }

  if (loading) {
    return <div className="h-10 w-36 bg-elevated rounded-sm animate-pulse" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={shelfItem
          ? `status-badge status-${shelfItem.status} py-2 px-4 cursor-pointer text-sm`
          : 'btn-primary'
        }
      >
        {shelfItem
          ? STATUSES.find(s => s.value === shelfItem.status)?.en || shelfItem.status
          : '+ Add to Shelf'
        }
      </button>

      {showAuthPrompt && (
        <p className="mt-2 text-xs text-muted font-body">Sign in to add books to your shelf</p>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 bg-elevated border border-border rounded-sm shadow-xl z-40 w-56 py-1">
            <p className="px-3 py-1.5 text-xs text-faint font-body uppercase tracking-widest border-b border-border mb-1">
              Set status
            </p>
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`w-full text-left px-3 py-2 font-body text-sm transition-colors hover:bg-border flex items-center justify-between
                  ${shelfItem?.status === s.value ? 'text-accent' : 'text-muted hover:text-text'}`}
              >
                <span>{s.en}</span>
                <span className="text-faint">{s.label}</span>
              </button>
            ))}

            {shelfItem && (
              <>
                <div className="border-t border-border mt-1 pt-1 px-3 pb-2">
                  <p className="text-xs text-faint font-body uppercase tracking-widest mb-2">Rating</p>
                  <div className="flex gap-1 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => updateRating(n)}
                        className={`w-7 h-7 text-xs font-body rounded-sm transition-colors
                          ${rating === n
                            ? 'bg-accent text-bg'
                            : 'bg-border text-muted hover:text-text'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-1">
                  <button
                    onClick={removeFromShelf}
                    className="w-full text-left px-3 py-2 font-body text-xs text-faint hover:text-red-400 transition-colors"
                  >
                    Remove from shelf
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
