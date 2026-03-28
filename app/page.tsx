import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { searchBooks } from '@/lib/books'
import { BookGridCard } from '@/components/BookCard'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Featured books — classic literature
  const featured = await searchBooks('subject:classics fiction', 8)

  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* Hero */}
      <section className="pt-24 pb-20 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl">
          <p className="font-body text-xs text-accent uppercase tracking-[0.3em] mb-4">
            積ん読 · Tsundoku
          </p>
          <h1 className="font-display text-6xl md:text-7xl text-text leading-[1.05] mb-6">
            Every book<br />
            <em className="text-accent">you've ever owned</em><br />
            deserves a record.
          </h1>
          <p className="font-body text-base text-muted leading-relaxed mb-10 max-w-lg">
            Track what you've read, what you're reading, and that ever-growing pile
            of books you swore you'd get to. Discover what to read next with AI.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/search" className="btn-primary">
              Find a book
            </Link>
            {!user && (
              <Link href="/search" className="btn-ghost">
                Browse without signing in
              </Link>
            )}
            {user && (
              <Link href="/shelf" className="btn-ghost">
                Go to my shelf →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border mb-16" />

      {/* Featured */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl text-text">Classics to start with</h2>
            <p className="font-body text-sm text-muted mt-0.5">Timeless reads worth tracking</p>
          </div>
          <Link href="/search" className="font-body text-sm text-accent hover:text-accent-hover transition-colors">
            Search all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
          {featured.slice(0, 8).map(book => (
            <BookGridCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* AI Feature callout */}
      <section className="mt-24 mb-4">
        <div className="border border-border rounded-sm p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-lg">
            <p className="font-body text-xs text-accent uppercase tracking-widest mb-3">AI-powered</p>
            <h3 className="font-display text-3xl text-text mb-3">
              Not sure what to read next?
            </h3>
            <p className="font-body text-sm text-muted leading-relaxed mb-6">
              Tell our AI what you loved (or didn't), and it'll suggest your next read —
              no algorithm, just taste.
            </p>
            <Link href="/shelf" className="btn-primary">
              Get a recommendation
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
