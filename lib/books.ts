export interface GoogleBook {
  id: string
  title: string
  authors: string[]
  description: string
  thumbnail: string
  publishedDate: string
  pageCount: number
  categories: string[]
  source?: string
}

export function parseGoogleBook(item: Record<string, unknown>): GoogleBook {
  const info = (item.volumeInfo as Record<string, unknown>) || {}
  const images = (info.imageLinks as Record<string, string>) || {}
  let thumbnail = images.thumbnail || images.smallThumbnail || ''
  thumbnail = thumbnail.replace('http://', 'https://')
  return {
    id: 'gb_' + (item.id as string),
    title: (info.title as string) || 'Unknown Title',
    authors: (info.authors as string[]) || [],
    description: (info.description as string) || '',
    thumbnail,
    publishedDate: (info.publishedDate as string) || '',
    pageCount: (info.pageCount as number) || 0,
    categories: (info.categories as string[]) || [],
    source: 'google',
  }
}

export function parseOpenLibraryBook(item: Record<string, unknown>): GoogleBook {
  const coverId = item.cover_i as number
  const thumbnail = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : ''
  const authors = Array.isArray(item.author_name)
    ? (item.author_name as string[]).slice(0, 3)
    : []
  return {
    id: 'ol_' + ((item.key as string) || '').replace('/works/', ''),
    title: (item.title as string) || 'Unknown Title',
    authors,
    description: '',
    thumbnail,
    publishedDate: String(item.first_publish_year || ''),
    pageCount: (item.number_of_pages_median as number) || 0,
    categories: (item.subject as string[] || []).slice(0, 3),
    source: 'openlibrary',
  }
}

export async function searchBooks(query: string, maxResults = 20): Promise<GoogleBook[]> {
  const results: GoogleBook[] = []

  // Google Books
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `&key=${apiKey}` : ''
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&orderBy=relevance${keyParam}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (data.items) {
        results.push(...data.items.map(parseGoogleBook))
      }
    }
  } catch (e) {
    console.error('Google Books error:', e)
  }

  // Open Library
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (data.docs) {
        results.push(...data.docs.map(parseOpenLibraryBook))
      }
    }
  } catch (e) {
    console.error('Open Library error:', e)
  }

  // Deduplicate by title similarity
  const seen = new Set<string>()
  return results.filter(b => {
    const key = b.title.toLowerCase().slice(0, 30)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, maxResults)
}

export async function getBook(id: string): Promise<GoogleBook | null> {
  if (id.startsWith('gb_')) {
    const realId = id.replace('gb_', '')
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const keyParam = apiKey ? `?key=${apiKey}` : ''
    const url = `https://www.googleapis.com/books/v1/volumes/${realId}${keyParam}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const item = await res.json()
    return parseGoogleBook(item)
  }

  if (id.startsWith('ol_')) {
    const workId = id.replace('ol_', '')
    const url = `https://openlibrary.org/works/${workId}.json`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    const desc = typeof data.description === 'string'
      ? data.description
      : data.description?.value || ''
    const coverId = Array.isArray(data.covers) ? data.covers[0] : null
    const thumbnail = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : ''
    return {
      id,
      title: data.title || 'Unknown',
      authors: [],
      description: desc,
      thumbnail,
      publishedDate: '',
      pageCount: 0,
      categories: [],
      source: 'openlibrary',
    }
  }

  return null
}
