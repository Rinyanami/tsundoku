'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); setMenuOpen(false) }

  return (
    <>
      <nav style={{ background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #252535' }}
        className="sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #c084fc, #a855f7)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(192,132,252,0.4)' }}>
              <span style={{ color: '#0d0d12', fontSize: 13, fontWeight: 700, fontFamily: 'serif' }}>読</span>
            </div>
            <span style={{ fontFamily: 'Noto Sans SC', fontWeight: 500, fontSize: 15, color: '#e8e0f0', letterSpacing: '0.05em' }}>積ん読</span>
          </Link>

          <div className="flex items-center gap-1">
            {[
              { href: '/search', label: '搜索' },
              { href: '/browse', label: '分类' },
              ...(user ? [{ href: '/shelf', label: '书架' }] : []),
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ padding: '6px 14px', borderRadius: 4, fontSize: 13, color: '#8a82a0', fontFamily: 'Noto Sans SC', transition: 'color 0.2s' }}
                className="hover:text-text">
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="relative ml-2">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #c084fc22, #7c3aed22)', border: '1px solid #c084fc44', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: '#c084fc', fontFamily: 'Noto Sans SC' }}>
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 40, background: '#1a1a24', border: '1px solid #252535', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: 160, zIndex: 50, padding: '4px 0' }}>
                    <p style={{ padding: '8px 14px', fontSize: 11, color: '#3a3550', borderBottom: '1px solid #252535', marginBottom: 4, fontFamily: 'Noto Sans SC' }}>
                      {user.email}
                    </p>
                    <Link href={`/user/${user.id}`} onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#8a82a0', fontFamily: 'Noto Sans SC' }}
                      className="hover:text-text">我的主页</Link>
                    <Link href="/shelf" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#8a82a0', fontFamily: 'Noto Sans SC' }}
                      className="hover:text-text">我的书架</Link>
                    <button onClick={signOut}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: 13, color: '#8a82a0', fontFamily: 'Noto Sans SC', background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover:text-text">退出登录</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm py-1.5 px-4 ml-2" style={{ fontSize: 13 }}>
                登录
              </button>
            )}
          </div>
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
