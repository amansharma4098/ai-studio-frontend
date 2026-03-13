'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ExternalLink, Loader2, Trash2, Key } from 'lucide-react'
import { credentialsApi } from '@/lib/api'

// ── Credential Type Definitions ─────────────────────────────────
const CREDENTIAL_CATEGORIES = [
  {
    name: 'AI Models', icon: '🧠',
    types: [
      { id: 'groq', name: 'Groq', description: 'Fast AI inference API', color: '#f97316', docsUrl: 'https://console.groq.com/keys',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'gsk_...' }] },
      { id: 'openai', name: 'OpenAI', description: 'GPT models and embeddings', color: '#10a37f', docsUrl: 'https://platform.openai.com/api-keys',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'sk-...' }] },
      { id: 'anthropic', name: 'Anthropic', description: 'Claude AI models', color: '#d4a574', docsUrl: 'https://console.anthropic.com/settings/keys',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'sk-ant-...' }] },
    ],
  },
  {
    name: 'Sales & CRM', icon: '💼',
    types: [
      { id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing platform', color: '#ff7a59', docsUrl: 'https://developers.hubspot.com',
        fields: [{ key: 'api_key', label: 'Private App Token', type: 'password' as const, placeholder: 'pat-...' }] },
      { id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM platform', color: '#00a1e0', docsUrl: 'https://developer.salesforce.com',
        fields: [
          { key: 'client_id', label: 'Client ID', type: 'text' as const, placeholder: 'Connected app client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' as const, placeholder: 'Connected app secret' },
          { key: 'instance_url', label: 'Instance URL', type: 'text' as const, placeholder: 'https://yourorg.salesforce.com' },
        ] },
      { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking API', color: '#0077b5', docsUrl: 'https://developer.linkedin.com',
        fields: [
          { key: 'client_id', label: 'Client ID', type: 'text' as const, placeholder: 'App Client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' as const, placeholder: 'App Client Secret' },
        ] },
    ],
  },
  {
    name: 'Finance', icon: '💰',
    types: [
      { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting and invoicing', color: '#2ca01c', docsUrl: 'https://developer.intuit.com',
        fields: [
          { key: 'client_id', label: 'Client ID', type: 'text' as const, placeholder: 'OAuth2 Client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' as const, placeholder: 'OAuth2 Client Secret' },
          { key: 'realm_id', label: 'Realm ID (Company ID)', type: 'text' as const, placeholder: '123456789' },
        ] },
      { id: 'alpha_vantage', name: 'Alpha Vantage', description: 'Stock and financial data', color: '#7c3aed', docsUrl: 'https://www.alphavantage.co/support/#api-key',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'Your API key' }] },
    ],
  },
  {
    name: 'Communication', icon: '💬',
    types: [
      { id: 'sendgrid', name: 'SendGrid', description: 'Transactional email service', color: '#1a82e2', docsUrl: 'https://app.sendgrid.com/settings/api_keys',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'SG...' }] },
      { id: 'smtp', name: 'SMTP', description: 'Custom SMTP email server', color: '#64748b', docsUrl: '',
        fields: [
          { key: 'host', label: 'SMTP Host', type: 'text' as const, placeholder: 'smtp.gmail.com' },
          { key: 'port', label: 'Port', type: 'text' as const, placeholder: '587' },
          { key: 'username', label: 'Username', type: 'text' as const, placeholder: 'you@email.com' },
          { key: 'password', label: 'Password', type: 'password' as const, placeholder: 'App password' },
        ] },
    ],
  },
  {
    name: 'Dev & IT', icon: '⚙️',
    types: [
      { id: 'github', name: 'GitHub', description: 'Code repos and issue tracking', color: '#333333', docsUrl: 'https://github.com/settings/tokens',
        fields: [{ key: 'token', label: 'Personal Access Token', type: 'password' as const, placeholder: 'ghp_...' }] },
      { id: 'jira', name: 'Jira', description: 'Project and issue tracking', color: '#0052cc', docsUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
        fields: [
          { key: 'email', label: 'Email', type: 'text' as const, placeholder: 'you@company.com' },
          { key: 'api_token', label: 'API Token', type: 'password' as const, placeholder: 'Your Jira API token' },
          { key: 'domain', label: 'Jira Domain', type: 'text' as const, placeholder: 'yourcompany.atlassian.net' },
        ] },
      { id: 'pagerduty', name: 'PagerDuty', description: 'Incident management', color: '#06ac38', docsUrl: 'https://support.pagerduty.com/docs/api-access-keys',
        fields: [{ key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'Your PagerDuty API key' }] },
    ],
  },
  {
    name: 'Support', icon: '🎧',
    types: [
      { id: 'zendesk', name: 'Zendesk', description: 'Customer support platform', color: '#03363d', docsUrl: 'https://developer.zendesk.com',
        fields: [
          { key: 'email', label: 'Email', type: 'text' as const, placeholder: 'agent@company.com' },
          { key: 'api_token', label: 'API Token', type: 'password' as const, placeholder: 'Your Zendesk API token' },
          { key: 'subdomain', label: 'Subdomain', type: 'text' as const, placeholder: 'yourcompany' },
        ] },
    ],
  },
  {
    name: 'Marketing', icon: '📣',
    types: [
      { id: 'google_analytics', name: 'Google Analytics', description: 'Website analytics and reporting', color: '#e37400', docsUrl: 'https://console.developers.google.com',
        fields: [
          { key: 'client_id', label: 'OAuth Client ID', type: 'text' as const, placeholder: 'Your client ID' },
          { key: 'client_secret', label: 'OAuth Client Secret', type: 'password' as const, placeholder: 'Your client secret' },
          { key: 'property_id', label: 'Property ID', type: 'text' as const, placeholder: 'GA-XXXXXXXXX' },
        ] },
      { id: 'twitter', name: 'Twitter / X', description: 'Social media posting and monitoring', color: '#000000', docsUrl: 'https://developer.twitter.com',
        fields: [
          { key: 'api_key', label: 'API Key', type: 'password' as const, placeholder: 'Your API key' },
          { key: 'api_secret', label: 'API Secret', type: 'password' as const, placeholder: 'Your API secret' },
          { key: 'bearer_token', label: 'Bearer Token', type: 'password' as const, placeholder: 'Your bearer token' },
        ] },
    ],
  },
]

const ALL_TYPES = CREDENTIAL_CATEGORIES.flatMap(c => c.types)

export default function CredentialsPage() {
  const qc = useQueryClient()
  const [highlight, setHighlight] = useState<string | null>(null)
  const [connectType, setConnectType] = useState<typeof ALL_TYPES[number] | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  // Read ?highlight= param and scroll to it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const h = params.get('highlight')
    if (h) {
      setHighlight(h)
      setTimeout(() => {
        document.getElementById(`cred-${h}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
      const timer = setTimeout(() => setHighlight(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const { data: configured = [], isLoading } = useQuery<any[]>({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.list().then(r => r.data),
  })

  const saveMut = useMutation({
    mutationFn: (data: any) => credentialsApi.save(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }); setConnectType(null); setFormData({}) },
  })

  const deleteMut = useMutation({
    mutationFn: credentialsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credentials'] }),
  })

  const getConfigured = (typeId: string) => configured.find((c: any) => c.credential_type === typeId)

  const openConnect = (type: typeof ALL_TYPES[number]) => {
    setConnectType(type)
    setFormData(Object.fromEntries(type.fields.map(f => [f.key, ''])))
  }

  const handleSave = () => {
    if (!connectType) return
    const allFilled = connectType.fields.every(f => formData[f.key]?.trim())
    if (!allFilled) return
    saveMut.mutate({ name: connectType.name, credential_type: connectType.id, ...formData })
  }

  const configuredCount = ALL_TYPES.filter(t => getConfigured(t.id)).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Credentials</h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect your services &mdash; API keys are encrypted at rest
          {!isLoading && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{configuredCount}/{ALL_TYPES.length} connected</span>}
        </p>
      </div>

      {CREDENTIAL_CATEGORIES.map(cat => (
        <div key={cat.name} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{cat.icon}</span>
            <h2 className="text-sm font-semibold text-slate-700">{cat.name}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{cat.types.length}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cat.types.map(type => {
              const cred = getConfigured(type.id)
              const isHighlighted = highlight === type.id
              return (
                <div key={type.id} id={`cred-${type.id}`}
                  className={`rounded-xl border bg-white p-4 transition-all ${isHighlighted ? 'border-amber-400 ring-2 ring-amber-200 shadow-md' : 'border-slate-200 hover:shadow-sm'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: type.color }}>
                      {type.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{type.name}</p>
                      <p className="text-[11px] text-slate-500">{type.description}</p>
                    </div>
                    {cred && (
                      <button onClick={() => deleteMut.mutate(cred.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Disconnect">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3">
                    {isLoading ? (
                      <span className="text-[11px] text-slate-400">Checking...</span>
                    ) : cred ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle size={11} /> Connected
                      </span>
                    ) : (
                      <button onClick={() => openConnect(type)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                        <Key size={11} /> Connect
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Connect Modal */}
      {connectType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5" onClick={() => setConnectType(null)}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: connectType.color }}>
                {connectType.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-800">Connect {connectType.name}</h2>
                <p className="text-xs text-slate-500">{connectType.description}</p>
              </div>
              <button onClick={() => setConnectType(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {connectType.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{field.label}</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}
              {connectType.docsUrl && (
                <a href={connectType.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  <ExternalLink size={11} /> Get your API key &rarr;
                </a>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setConnectType(null)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saveMut.isPending}
                  className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saveMut.isPending ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Credential'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
