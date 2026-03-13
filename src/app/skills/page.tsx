'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, CheckCircle, AlertTriangle } from 'lucide-react'
import { credentialsApi } from '@/lib/api'

// ── Skill Definitions with Required Credentials ─────────────────
const SKILL_CATEGORIES = [
  {
    name: 'AI & Language', icon: '🧠', color: 'violet',
    skills: [
      { id: 'groq_chat', name: 'Groq Chat', description: 'Fast inference with Groq-hosted LLMs', requiredCredentials: ['groq'] },
      { id: 'openai_chat', name: 'OpenAI Chat', description: 'Chat completions with GPT models', requiredCredentials: ['openai'] },
      { id: 'claude_chat', name: 'Claude Chat', description: 'Chat with Anthropic Claude models', requiredCredentials: ['anthropic'] },
    ],
  },
  {
    name: 'Data & Analytics', icon: '📊', color: 'blue',
    skills: [
      { id: 'sql_query', name: 'SQL Query', description: 'Query databases and analyze structured data', requiredCredentials: [] },
      { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze datasets and generate insights', requiredCredentials: [] },
      { id: 'stock_data', name: 'Stock Market Data', description: 'Fetch real-time and historical stock data', requiredCredentials: ['alpha_vantage'] },
    ],
  },
  {
    name: 'Web & APIs', icon: '🌐', color: 'sky',
    skills: [
      { id: 'web_scraping', name: 'Web Scraper', description: 'Scrape and extract data from websites', requiredCredentials: [] },
      { id: 'rest_api', name: 'REST API', description: 'Call external REST APIs to fetch or send data', requiredCredentials: [] },
    ],
  },
  {
    name: 'Communication', icon: '💬', color: 'emerald',
    skills: [
      { id: 'sendgrid_email', name: 'SendGrid Email', description: 'Send transactional emails via SendGrid', requiredCredentials: ['sendgrid'] },
      { id: 'smtp_email', name: 'SMTP Email', description: 'Send emails via custom SMTP server', requiredCredentials: ['smtp'] },
    ],
  },
  {
    name: 'Sales & CRM', icon: '💼', color: 'orange',
    skills: [
      { id: 'hubspot_crm', name: 'HubSpot CRM', description: 'Manage contacts and deals in HubSpot', requiredCredentials: ['hubspot'] },
      { id: 'salesforce_query', name: 'Salesforce Query', description: 'Query and manage Salesforce records', requiredCredentials: ['salesforce'] },
      { id: 'linkedin_outreach', name: 'LinkedIn Outreach', description: 'Manage LinkedIn connections and messages', requiredCredentials: ['linkedin'] },
    ],
  },
  {
    name: 'Dev & IT', icon: '⚙️', color: 'slate',
    skills: [
      { id: 'github_issues', name: 'GitHub Issues', description: 'Create and manage GitHub issues and PRs', requiredCredentials: ['github'] },
      { id: 'jira_tickets', name: 'Jira Tickets', description: 'Create and track Jira issues', requiredCredentials: ['jira'] },
      { id: 'pagerduty_alerts', name: 'PagerDuty Alerts', description: 'Manage incidents and on-call schedules', requiredCredentials: ['pagerduty'] },
    ],
  },
  {
    name: 'Support', icon: '🎧', color: 'teal',
    skills: [
      { id: 'zendesk_tickets', name: 'Zendesk Tickets', description: 'Manage support tickets and customer queries', requiredCredentials: ['zendesk'] },
    ],
  },
  {
    name: 'Marketing', icon: '📣', color: 'amber',
    skills: [
      { id: 'google_analytics', name: 'Google Analytics', description: 'Fetch website analytics and traffic reports', requiredCredentials: ['google_analytics'] },
      { id: 'twitter_posts', name: 'Twitter / X', description: 'Post tweets and monitor social mentions', requiredCredentials: ['twitter'] },
    ],
  },
]

const COLOR_MAP: Record<string, { badge: string; header: string }> = {
  violet: { badge: 'bg-violet-100 text-violet-700', header: 'border-violet-200' },
  blue: { badge: 'bg-blue-100 text-blue-700', header: 'border-blue-200' },
  sky: { badge: 'bg-sky-100 text-sky-700', header: 'border-sky-200' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700', header: 'border-emerald-200' },
  orange: { badge: 'bg-orange-100 text-orange-700', header: 'border-orange-200' },
  slate: { badge: 'bg-slate-200 text-slate-700', header: 'border-slate-300' },
  teal: { badge: 'bg-teal-100 text-teal-700', header: 'border-teal-200' },
  amber: { badge: 'bg-amber-100 text-amber-700', header: 'border-amber-200' },
}

const CRED_LABELS: Record<string, string> = {
  groq: 'Groq', openai: 'OpenAI', anthropic: 'Anthropic',
  hubspot: 'HubSpot', salesforce: 'Salesforce', linkedin: 'LinkedIn',
  quickbooks: 'QuickBooks', alpha_vantage: 'Alpha Vantage',
  sendgrid: 'SendGrid', smtp: 'SMTP',
  github: 'GitHub', jira: 'Jira', pagerduty: 'PagerDuty',
  zendesk: 'Zendesk', google_analytics: 'Google Analytics', twitter: 'Twitter',
}

export default function SkillsPage() {
  const [search, setSearch] = useState('')

  const { data: configured = [], isLoading } = useQuery<any[]>({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.list().then(r => r.data),
  })

  const configuredTypes = new Set(configured.map((c: any) => c.credential_type))

  const isReady = (requiredCreds: string[]) =>
    requiredCreds.length === 0 || requiredCreds.every(c => configuredTypes.has(c))

  const totalSkills = SKILL_CATEGORIES.reduce((a, c) => a + c.skills.length, 0)
  const readyCount = SKILL_CATEGORIES.reduce((a, c) => a + c.skills.filter(s => isReady(s.requiredCredentials)).length, 0)

  const filtered = search.trim()
    ? SKILL_CATEGORIES.map(cat => ({
        ...cat,
        skills: cat.skills.filter(s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.skills.length > 0)
    : SKILL_CATEGORIES

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Skills Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalSkills} skills across {SKILL_CATEGORIES.length} categories
          {!isLoading && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {readyCount} ready
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Search skills — e.g. email, GitHub, analytics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {SKILL_CATEGORIES.map(cat => {
          const colors = COLOR_MAP[cat.color] || COLOR_MAP.slate
          return (
            <button key={cat.name} onClick={() => setSearch('')}
              className={`flex items-center gap-1.5 rounded-lg border ${colors.header} bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50`}>
              <span>{cat.icon}</span>
              {cat.name}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${colors.badge}`}>{cat.skills.length}</span>
            </button>
          )
        })}
      </div>

      {isLoading && <div className="text-center py-20 text-slate-400">Loading...</div>}

      {/* Skill Categories */}
      {filtered.map(cat => {
        const colors = COLOR_MAP[cat.color] || COLOR_MAP.slate
        return (
          <div key={cat.name} className="mb-6">
            <div className={`flex items-center gap-2 rounded-lg border ${colors.header} bg-white px-4 py-3 mb-3`}>
              <span className="text-lg">{cat.icon}</span>
              <h2 className="text-sm font-semibold text-slate-800">{cat.name}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.badge}`}>
                {cat.skills.length} {cat.skills.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cat.skills.map(skill => {
                const ready = isReady(skill.requiredCredentials)
                const missingCreds = skill.requiredCredentials.filter(c => !configuredTypes.has(c))
                return (
                  <div key={skill.id} className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-slate-800">{skill.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{skill.description}</p>
                    </div>
                    {/* Required credential tags */}
                    {skill.requiredCredentials.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {skill.requiredCredentials.map(credId => (
                          <span key={credId} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            configuredTypes.has(credId) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {CRED_LABELS[credId] || credId}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Status badge */}
                    {ready ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle size={10} /> Ready
                      </span>
                    ) : (
                      <Link href={`/credentials?highlight=${missingCreds[0]}`}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-200 transition-colors">
                        <AlertTriangle size={10} /> Setup needed &rarr;
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-sm font-semibold text-slate-400">No skills match &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  )
}
