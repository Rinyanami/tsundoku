'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'webnovel', label: '网络小说' },
  { value: 'lightnovel', label: '轻小说' },
  { value: 'literature', label: '文学' },
  { value: 'manga', label: '漫画' },
  { value: 'other', label: '其他' },
]

export default function ManualAddModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [category, setCategory] = useState('webnovel')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [publishedDate, setPublishedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const submit = async () => {
    if (!title.trim()) { setError('书名不能为空'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/books/add', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        authors: authors ? authors.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
        category,
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        publishedDate: publishedDate.trim(),
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push(`/book/${data.book.id}`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 12, padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 22, color: '#e8e0f0', marginBottom: 6 }}>手动添加书目</h2>
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', marginBottom: 24 }}>添加后所有用户都能搜索到这本书</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>书名 *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="斗罗大陆" />
          </div>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>作者</label>
            <input value={authors} onChange={e => setAuthors(e.target.value)} className="input" placeholder="唐家三少（多个用逗号分隔）" />
          </div>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>分类</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setCategory(c.value)}
                  style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontFamily: 'Noto Sans SC', cursor: 'pointer', transition: 'all 0.2s', background: category === c.value ? 'rgba(192,132,252,0.12)' : '#1a1a24', border: category === c.value ? '1px solid rgba(192,132,252,0.35)' : '1px solid #252535', color: category === c.value ? '#c084fc' : '#8a82a0' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>封面图片 URL</label>
            <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="input" placeholder="https://..." />
          </div>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>年份</label>
            <input value={publishedDate} onChange={e => setPublishedDate(e.target.value)} className="input" placeholder="2008" />
          </div>
          <div>
            <label style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>简介</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input" style={{ resize: 'none' }} placeholder="简单介绍一下……" />
          </div>
        </div>

        {error && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#f87171', marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>取消</button>
          <button onClick={submit} disabled={loading || !title.trim()} className="btn-primary" style={{ flex: 1, fontSize: 14 }}>
            {loading ? '添加中…' : '添加书目'}
          </button>
        </div>
      </div>
    </div>
  )
}
