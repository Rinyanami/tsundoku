import Link from 'next/link'
import Image from 'next/image'
import type { GoogleBook } from '@/lib/books'

const STATUS_LABELS: Record<string, string> = {
  want_to_read: '想读', reading: '在读', completed: '读完', on_hold: '搁置', dropped: '抛弃',
}

const CAT_LABELS: Record<string, string> = {
  webnovel: '网文', lightnovel: '轻小说', literature: '文学', manga: '漫画', other: '其他',
}

interface BookCardProps {
  book: GoogleBook & { category?: string }
  status?: string
  rating?: number
  compact?: boolean
}

export function BookGridCard({ book, status }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div style={{ position: 'relative' }}>
        <div style={{ aspectRatio: '2/3', borderRadius: 6, overflow: 'hidden', marginBottom: 10, position: 'relative', background: 'linear-gradient(135deg, #1a1a24, #13131a)', border: '1px solid #252535' }}>
          {book.thumbnail ? (
            <Image src={book.thumbnail} alt={book.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 180px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
              <span style={{ fontFamily: 'Noto Serif SC', fontSize: 12, color: '#3a3550', textAlign: 'center', lineHeight: 1.5 }}>
                {book.title.slice(0, 20)}
              </span>
            </div>
          )}
          {status && (
            <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
              <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>
            </div>
          )}
          {book.category && book.category !== 'other' && (
            <div style={{ position: 'absolute', top: 6, right: 6 }}>
              <span className={`cat-badge cat-${book.category}`}>{CAT_LABELS[book.category]}</span>
            </div>
          )}
        </div>
        <h3 style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#e8e0f0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }}
          className="group-hover:text-accent">
          {book.title}
        </h3>
        {book.authors.length > 0 && (
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#8a82a0', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {book.authors[0]}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function BookCard({ book, status, rating }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div style={{ display: 'flex', gap: 14, padding: '12px 8px', borderRadius: 6, transition: 'background 0.2s' }} className="hover:bg-elevated">
        <div style={{ width: 52, height: 72, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a24, #13131a)', border: '1px solid #252535', position: 'relative' }}>
          {book.thumbnail ? (
            <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="52px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#3a3550', fontFamily: 'Noto Serif SC', textAlign: 'center', padding: 4 }}>{book.title.slice(0, 8)}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontFamily: 'Noto Sans SC', fontSize: 14, color: '#e8e0f0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }} className="group-hover:text-accent">
            {book.title}
          </h3>
          {book.authors.length > 0 && (
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0', marginTop: 3 }}>{book.authors.join('、')}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            {status && <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>}
            {rating && <span style={{ fontSize: 12, color: '#f0b860', fontFamily: 'Noto Sans SC', fontWeight: 500 }}>★ {rating}/10</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
