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

  const signOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="border-b border-border bg-bg/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-display text-xl text-accent tracking-tight">積ん読</span>
            <span className="font-body text-xs text-faint tracking-widest uppercase group-hover:text-muted transition-colors">
              Tsundoku
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link href="/search" className="font-body text-sm text-muted hover:text-text transition-colors">
              Search
            </Link>
            {user && (
              <Link href="/shelf" className="font-body text-sm text-muted hover:text-text transition-colors">
                My Shelf
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center hover:border-accent/50 transition-colors"
                >
                  <span className="font-body text-xs text-muted">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-elevated border border-border rounded-sm shadow-lg py-1 min-w-36 z-50">
                    <p className="px-3 py-1.5 text-xs text-faint font-body truncate border-b border-border mb-1">
                      {user.email}
                    </p>
                    <Link
                      href="/shelf"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-1.5 text-sm text-muted hover:text-text font-body transition-colors"
                    >
                      My Shelf
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-3 py-1.5 text-sm text-muted hover:text-text font-body transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm py-1.5 px-4">
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
