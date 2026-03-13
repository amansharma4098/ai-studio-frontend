'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true); setError('')
    try {
      const { data } = await authApi.signup(form)
      localStorage.setItem('token', data.access_token)
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Signup failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#07070f' }}>
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AI Studio</span>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Get started with AI Studio today</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Full Name *</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Alex Chen"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email address *</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Organization</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Contoso Ltd"
              value={form.organization}
              onChange={e => setForm({ ...form, organization: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="auth-input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="group mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
            }}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
