import { getBook } from '@/lib/books'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ShelfButton from '@/components/ShelfButton'
import ReviewSection from '@/components/ReviewSection'
import TagSection from '@/components/TagSection'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const CAT_LABELS: Record<string, string> = {
  webnovel: '网络小说', lightnovel: '轻小说', literature: '文学', manga: '漫画', other: '其他',
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id)
  if (!book) notFound()

  const supabase = createClient()
  const { data: ratings } = await supabase
    .from('reviews').select('rating').eq('book_id', params.id).not('rating', 'is', null)

  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/search" style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', display: 'inline-block', marginBottom: 32, transition: 'color 0.2s' }} className="hover:text-accent">
        ← 返回搜索
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 48 }}>
        {/* Cover column */}
        <div>
          <div style={{ aspectRatio: '2/3', borderRadius: 8, overflow: 'hidden', marginBottom: 16, position: 'relative', background: 'linear-gradient(135deg, #1a1a24, #13131a)', border: '1px solid #252535', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {book.thumbnail ? (
              <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="200px" priority />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <span style={{ fontFamily: 'Noto Serif SC', fontSize: 14, color: '#3a3550', textAlign: 'center', lineHeight: 1.6 }}>{book.title}</span>
              </div>
            )}
          </div>

          <ShelfButton book={book} />

          {/* Community score */}
          {avgRating && (
            <div style={{ marginTop: 16, background: '#13131a', border: '1px solid #252535', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', marginBottom: 6 }}>社区评分</p>
              <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 42, color: '#f0b860', lineHeight: 1, fontWeight: 300 }}>{avgRating}</p>
              <p style={{ fontSize: 11, color: '#8a82a0', fontFamily: 'Noto Sans SC', marginTop: 4 }}>{ratings!.length} 人评分</p>
            </div>
          )}
        </div>

        {/* Info column */}
        <div>
          <h1 style={{ fontFamily: 'Noto Serif SC', fontSize: 36, color: '#e8e0f0', lineHeight: 1.3, marginBottom: 8, fontWeight: 400 }}>
            {book.title}
          </h1>

          {book.authors.length > 0 && (
            <p style={{ fontFamily: 'Noto Sans SC', fontSize: 15, color: '#8a82a0', marginBottom: 20 }}>
              {book.authors.join('、')}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {book.publishedDate && (
              <span style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0', background: '#1a1a24', border: '1px solid #252535', borderRadius: 4, padding: '3px 10px' }}>
                {book.publishedDate.slice(0, 4)} 年
              </span>
            )}
            {book.pageCount > 0 && (
              <span style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0', background: '#1a1a24', border: '1px solid #252535', borderRadius: 4, padding: '3px 10px' }}>
                {book.pageCount} 页
              </span>
            )}
            {book.categories.slice(0, 3).map(cat => (
              <span key={cat} style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#8a82a0', background: '#1a1a24', border: '1px solid #252535', borderRadius: 4, padding: '3px 10px' }}>{cat}</span>
            ))}
          </div>

          {/* Description */}
          {book.description && (
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>简介</p>
              <p style={{ fontFamily: 'Noto Sans SC', fontSize: 14, color: '#8a82a0', lineHeight: 1.9, maxWidth: 560 }}
                dangerouslySetInnerHTML={{ __html: book.description }} />
            </div>
          )}

          {/* Tags */}
          <TagSection bookId={params.id} />

          {/* Reviews */}
          <ReviewSection bookId={params.id} />
        </div>
      </div>
    </div>
  )
}
