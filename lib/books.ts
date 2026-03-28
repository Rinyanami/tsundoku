export interface GoogleBook {
  id: string
  title: string
  authors: string[]
  description: string
  thumbnail: string
  publishedDate: string
  pageCount: number
  categories: string[]
}

export function parseGoogleBook(item: Record<string, unknown>): GoogleBook {
  const info = (item.volumeInfo as Record<string, unknown>) || {}
  const images = (info.imageLinks as Record<string, string>) || {}

  // Use HTTPS thumbnail
  let thumbnail = images.thumbnail || images.smallThumbnail || ''
  thumbnail = thumbnail.replace('http://', 'https://')

  return {
    id: item.id as string,
    title: (info.title as string) || 'Unknown Title',
    authors: (info.authors as string[]) || [],
    description: (info.description as string) || '',
    thumbnail,
    publishedDate: (info.publishedDate as string) || '',
    pageCount: (info.pageCount as number) || 0,
    categories: (info.categories as string[]) || [],
  }
}

export async function searchBooks(query: string, maxResults = 20): Promise<GoogleBook[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const keyParam = apiKey ? `&key=${apiKey}` : ''
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=en${keyParam}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const data = await res.json()
  if (!data.items) return []

  return data.items.map(parseGoogleBook)
}

export async function getBook(id: string): Promise<GoogleBook | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const keyParam = apiKey ? `?key=${apiKey}` : ''
  const url = `https://www.googleapis.com/books/v1/volumes/${id}${keyParam}`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null

  const item = await res.json()
  return parseGoogleBook(item)
}
