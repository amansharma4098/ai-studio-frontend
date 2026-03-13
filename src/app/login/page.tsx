'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handle = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await authApi.login(form.email, form.password)
      localStorage.setItem('token', data.access_token)
      setAuth(data.user, data.access_token)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Authentication failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2.5 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">AI Studio</span>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Your AI development environment</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Email address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-3.5 py-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handle}
              disabled={loading}
              className="w-full rounded-lg py-[11px] text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
              style={{ height: '44px' }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
