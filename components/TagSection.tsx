'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tag { id: string; name: string; count: number }

export default function TagSection({ bookId }: { bookId: string }) {
  const [tags, setTags] = useState<Tag[]>([])
  const [myTags, setMyTags] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) setUser(u.id)

      // Get all tags for this book
      const { data } = await supabase
        .from('book_tags')
        .select('tag_id, tags(id, name, count)')
        .eq('book_id', bookId)

      if (data) {
        const tagMap = new Map<string, Tag>()
        data.forEach((row: Record<string, unknown>) => {
          const t = row.tags as Tag
          if (t) {
            if (!tagMap.has(t.id)) tagMap.set(t.id, { ...t, count: 0 })
            tagMap.get(t.id)!.count++
          }
        })
        setTags(Array.from(tagMap.values()).sort((a, b) => b.count - a.count))

        if (u) {
          const mine = data.filter((r: Record<string, unknown>) => r.user_id === u.id).map((r: Record<string, unknown>) => (r.tags as Tag)?.id).filter(Boolean)
          setMyTags(mine as string[])
        }
      }
      setLoading(false)
    }
    load()
  }, [bookId])

  const addTag = async () => {
    if (!user || !input.trim()) return
    const tagName = input.trim().toLowerCase()
    setInput('')

    // Upsert tag
    const { data: tag } = await supabase.from('tags').upsert({ name: tagName }, { onConflict: 'name' }).select().single()
    if (!tag) return

    // Add book_tag
    await supabase.from('book_tags').upsert({ book_id: bookId, tag_id: tag.id, user_id: user }, { onConflict: 'book_id,tag_id,user_id' })

    // Refresh
    setMyTags(prev => [...prev, tag.id])
    setTags(prev => {
      const existing = prev.find(t => t.id === tag.id)
      if (existing) return prev.map(t => t.id === tag.id ? { ...t, count: t.count + 1 } : t)
      return [...prev, { ...tag, count: 1 }]
    })
  }

  const removeTag = async (tagId: string) => {
    if (!user) return
    await supabase.from('book_tags').delete().eq('book_id', bookId).eq('tag_id', tagId).eq('user_id', user)
    setMyTags(prev => prev.filter(id => id !== tagId))
    setTags(prev => prev.map(t => t.id === tagId ? { ...t, count: t.count - 1 } : t).filter(t => t.count > 0))
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <p style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>标签</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {loading && <span style={{ fontSize: 12, color: '#3a3550', fontFamily: 'Noto Sans SC' }}>加载中…</span>}
        {!loading && tags.length === 0 && <span style={{ fontSize: 12, color: '#3a3550', fontFamily: 'Noto Sans SC' }}>还没有标签，来加一个吧</span>}
        {tags.map(tag => (
          <button key={tag.id}
            onClick={() => myTags.includes(tag.id) ? removeTag(tag.id) : undefined}
            style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontFamily: 'Noto Sans SC', cursor: myTags.includes(tag.id) ? 'pointer' : 'default',
              background: myTags.includes(tag.id) ? 'rgba(192,132,252,0.12)' : '#1a1a24',
              border: myTags.includes(tag.id) ? '1px solid rgba(192,132,252,0.35)' : '1px solid #252535',
              color: myTags.includes(tag.id) ? '#c084fc' : '#8a82a0',
              transition: 'all 0.2s',
            }}>
            {tag.name}
            <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 10 }}>{tag.count}</span>
          </button>
        ))}
      </div>

      {user && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="添加标签（回车确认）"
            style={{ flex: 1, maxWidth: 240, padding: '6px 12px', background: '#1a1a24', border: '1px solid #252535', borderRadius: 4, fontSize: 12, color: '#e8e0f0', fontFamily: 'Noto Sans SC', outline: 'none' }} />
          <button onClick={addTag} disabled={!input.trim()}
            style={{ padding: '6px 14px', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 4, fontSize: 12, color: '#c084fc', fontFamily: 'Noto Sans SC', cursor: 'pointer' }}>
            添加
          </button>
        </div>
      )}
      {!user && <p style={{ fontSize: 11, color: '#3a3550', fontFamily: 'Noto Sans SC' }}>登录后可以添加标签</p>}
    </div>
  )
}
