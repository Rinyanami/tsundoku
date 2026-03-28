import { getBook } from '@/lib/books'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ShelfButton from '@/components/ShelfButton'
import Link from 'next/link'

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id)
  if (!book) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/search" className="font-body text-sm text-muted hover:text-text transition-colors mb-10 inline-block">
        ← Back to search
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12 mt-6">
        {/* Cover */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[2/3] cover-placeholder rounded-sm overflow-hidden relative w-full max-w-[240px]">
            {book.thumbnail ? (
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover"
                sizes="240px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6">
                <span className="font-display text-muted text-center leading-tight">
                  {book.title}
                </span>
              </div>
            )}
          </div>

          <ShelfButton book={book} />
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-text leading-tight mb-2">
            {book.title}
          </h1>

          {book.authors.length > 0 && (
            <p className="font-body text-base text-muted mb-6">
              {book.authors.join(', ')}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {book.publishedDate && (
              <span className="font-body text-xs text-faint border border-border rounded-sm px-3 py-1">
                {book.publishedDate.slice(0, 4)}
              </span>
            )}
            {book.pageCount > 0 && (
              <span className="font-body text-xs text-faint border border-border rounded-sm px-3 py-1">
                {book.pageCount} pages
              </span>
            )}
            {book.categories.slice(0, 3).map(cat => (
              <span key={cat} className="font-body text-xs text-faint border border-border rounded-sm px-3 py-1">
                {cat}
              </span>
            ))}
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h2 className="font-body text-xs text-faint uppercase tracking-widest mb-3">
                Description
              </h2>
              <p className="font-body text-sm text-muted leading-relaxed max-w-2xl"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
