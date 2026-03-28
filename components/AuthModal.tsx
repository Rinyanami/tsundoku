'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onClose()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm p-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="mb-8">
          <h2 className="font-display text-3xl text-text mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Join Tsundoku'}
          </h2>
          <p className="font-body text-sm text-muted">
            {mode === 'signin' ? 'Sign in to your shelf' : 'Start tracking your reading'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="input w-full"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 font-body">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm text-green-400 font-body">{success}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="btn-primary w-full mt-5"
        >
          {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-muted font-body">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-accent hover:text-accent-hover transition-colors"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
