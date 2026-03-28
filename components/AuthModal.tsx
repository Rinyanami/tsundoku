'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const submit = async () => {
    setLoading(true); setError(''); setSuccess('')
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onClose()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('注册成功！请查收邮件确认账号。')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: '#13131a', border: '1px solid #252535', borderRadius: 12, padding: 36, width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s ease' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(192,132,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, color: '#c084fc' }}>読</span>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Noto Serif SC', fontSize: 24, color: '#e8e0f0', textAlign: 'center', marginBottom: 6 }}>
          {mode === 'signin' ? '欢迎回来' : '加入積ん読'}
        </h2>
        <p style={{ fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0', textAlign: 'center', marginBottom: 28 }}>
          {mode === 'signin' ? '登录你的书架' : '开始记录你的阅读旅程'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} className="input" />
          <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} className="input" />
        </div>

        {error && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ fontFamily: 'Noto Sans SC', fontSize: 12, color: '#6ee7a0', marginBottom: 12 }}>{success}</p>}

        <button onClick={submit} disabled={loading || !email || !password} className="btn-primary" style={{ width: '100%', marginBottom: 16, fontSize: 14 }}>
          {loading ? '加载中…' : mode === 'signin' ? '登录' : '注册'}
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'Noto Sans SC', fontSize: 13, color: '#8a82a0' }}>
          {mode === 'signin' ? '还没有账号？' : '已有账号？'}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ color: '#c084fc', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Noto Sans SC', fontSize: 13, marginLeft: 4 }}>
            {mode === 'signin' ? '注册' : '登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
