'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, Brain, Shield, Workflow, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const features = [
  { icon: Brain, title: 'AI Agent Orchestration', desc: 'Deploy and manage intelligent agents at scale' },
  { icon: Workflow, title: 'Visual Workflows', desc: 'Build complex automation with drag-and-drop' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SSO via Microsoft Entra ID & OAuth2' },
]

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ email: 'admin@contoso.com', name: '', organization: '', password: 'password123' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handle = async () => {
    setLoading(true); setError('')
    try {
      const fn = tab === 'login' ? authApi.login(form.email, form.password) : authApi.signup(form)
      const { data } = await fn
      setAuth(data.user, data.access_token)
      router.push('/skills')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Authentication failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#07070f' }}>
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(109,92,231,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(56,189,248,0.15) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)'
        }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glowing orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AI Studio</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5">
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-xs font-medium text-violet-300">Enterprise AI Platform</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              Automate the future<br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">with intelligent AI</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-sm">
              Build, deploy, and orchestrate AI agents connected to your Microsoft Azure ecosystem.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <Icon size={16} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
          <span className="text-xs text-slate-500">All systems operational · Azure & Ollama powered</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 relative">
        {/* Subtle right-side glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />

        <div className="w-full max-w-[380px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AI Studio</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {tab === 'login' ? 'Sign in to your AI Studio workspace' : 'Get started with AI Studio today'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200"
                style={tab === t ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(79,70,229,0.9))',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.35)'
                } : { color: '#64748b' }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            {tab === 'signup' && (
              <>
                <FormField label="Full Name">
                  <input
                    className="auth-input"
                    placeholder="Alex Chen"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Organization">
                  <input
                    className="auth-input"
                    placeholder="Contoso Ltd"
                    value={form.organization}
                    onChange={e => setForm({ ...form, organization: e.target.value })}
                  />
                </FormField>
              </>
            )}

            <FormField label="Email address">
              <input
                type="email"
                className="auth-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </FormField>

            <FormField label="Password">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FormField>

            {tab === 'login' && (
              <div className="flex justify-end">
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl px-3.5 py-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handle}
              disabled={loading}
              className="group mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)' }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Authenticating…</>
              ) : (
                <>{tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[11px] text-slate-600">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* SSO button */}
          <button className="w-full rounded-xl py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 flex items-center justify-center gap-2.5 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.4)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            {/* Microsoft icon */}
            <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continue with Microsoft Entra
          </button>

          <p className="mt-6 text-center text-[11px] text-slate-600">
            By continuing, you agree to our{' '}
            <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">Terms</span>
            {' & '}
            <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  )
}
