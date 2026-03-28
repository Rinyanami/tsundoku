import Link from 'next/link'
import Image from 'next/image'
import type { GoogleBook } from '@/lib/books'

const STATUS_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
}

interface BookCardProps {
  book: GoogleBook
  status?: string
  rating?: number
  compact?: boolean
}

export default function BookCard({ book, status, rating, compact = false }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="flex gap-4 p-3 rounded-sm transition-colors hover:bg-surface">
        {/* Cover */}
        <div className={`flex-shrink-0 ${compact ? 'w-12' : 'w-16'} relative`}>
          <div
            className={`${compact ? 'h-16' : 'h-24'} w-full cover-placeholder rounded-sm overflow-hidden`}
          >
            {book.thumbnail ? (
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-faint text-xs text-center px-1 leading-tight">
                  {book.title.slice(0, 20)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-display text-base text-text leading-tight line-clamp-2 group-hover:text-accent transition-colors">
            {book.title}
          </h3>
          {book.authors.length > 0 && (
            <p className="font-body text-xs text-muted mt-0.5 truncate">
              {book.authors.join(', ')}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {status && (
              <span className={`status-badge status-${status}`}>
                {STATUS_LABELS[status] || status}
              </span>
            )}
            {rating && (
              <span className="font-body text-xs text-accent font-medium">
                ★ {rating}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Grid variant for search results
export function BookGridCard({ book, status }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="relative">
        {/* Cover */}
        <div className="aspect-[2/3] cover-placeholder rounded-sm overflow-hidden mb-2 relative">
          {book.thumbnail ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-3">
              <span className="font-display text-faint text-sm text-center leading-tight">
                {book.title.slice(0, 40)}
              </span>
            </div>
          )}
          {status && (
            <div className="absolute bottom-2 left-2">
              <span className={`status-badge status-${status}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="font-display text-sm text-text leading-tight line-clamp-2 group-hover:text-accent transition-colors">
          {book.title}
        </h3>
        {book.authors.length > 0 && (
          <p className="font-body text-xs text-muted mt-0.5 truncate">
            {book.authors[0]}
          </p>
        )}
      </div>
    </Link>
  )
}
