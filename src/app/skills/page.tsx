'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronDown, ChevronRight, Shield, Globe } from 'lucide-react'
import { skillsApi } from '@/lib/api'

const CATEGORY_META: Record<string, { color: string; border: string }> = {
  'cat-entra': { color: '#7c3aed', border: 'border-purple-300' },
  'cat-azure': { color: '#0089d6', border: 'border-blue-300' },
  'cat-web': { color: '#0ea5e9', border: 'border-sky-300' },
  'cat-data': { color: '#8b5cf6', border: 'border-purple-300' },
  'cat-comm': { color: '#10b981', border: 'border-emerald-300' },
  'cat-devops': { color: '#f59e0b', border: 'border-amber-300' },
}

const BADGE_CLASS: Record<string, string> = {
  'cat-entra': 'bg-purple-100 text-purple-700',
  'cat-azure': 'bg-blue-100 text-blue-700',
  'cat-web': 'bg-sky-100 text-sky-700',
  'cat-data': 'bg-purple-100 text-purple-700',
  'cat-comm': 'bg-emerald-100 text-emerald-700',
  'cat-devops': 'bg-amber-100 text-amber-700',
}

interface Skill {
  id: string; name: string; label: string; desc: string; icon: string; params: string[];
}
interface TagGroup { tag: string; skills: Skill[] }
interface Category {
  id: string; name: string; icon: string; credType: string;
  tags: TagGroup[];
}

export default function SkillsPage() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedSkill, setSelectedSkill] = useState<Skill & { catId: string } | null>(null)

  const { data: catalog = [], isLoading } = useQuery<Category[]>({
    queryKey: ['skills-catalog'],
    queryFn: () => skillsApi.getCatalog().then(r => r.data),
  })

  // Filter by search
  const filtered = search.trim()
    ? catalog.map(cat => ({
        ...cat,
        tags: cat.tags.map(t => ({
          ...t,
          skills: t.skills.filter(s =>
            s.label.toLowerCase().includes(search.toLowerCase()) ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.desc.toLowerCase().includes(search.toLowerCase())
          )
        })).filter(t => t.skills.length > 0)
      })).filter(cat => cat.tags.length > 0)
    : catalog

  const toggleCat = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: prev[id] === false ? true : false }))

  const totalSkills = catalog.reduce((a, c) => a + c.tags.reduce((b, t) => b + t.skills.length, 0), 0)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Skills Library</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalSkills} pre-built skills across {catalog.length} categories
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Search skills — e.g. create group, cosmos metrics, forecast cost..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {catalog.map(cat => {
          const meta = CATEGORY_META[cat.id] || {}
          const badge = BADGE_CLASS[cat.id] || 'bg-slate-100 text-slate-600'
          const count = cat.tags.reduce((a, t) => a + t.skills.length, 0)
          return (
            <button
              key={cat.id}
              onClick={() => setSearch('')}
              className={`flex items-center gap-1.5 rounded-lg border ${meta.border || 'border-slate-200'} bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50`}
            >
              <span>{cat.icon}</span>
              {cat.name}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badge}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="text-center py-20 text-slate-400">Loading skill catalog...</div>
      )}

      {/* Categories */}
      {filtered.map(cat => {
        const meta = CATEGORY_META[cat.id] || {}
        const badge = BADGE_CLASS[cat.id] || 'bg-slate-100 text-slate-600'
        const isOpen = expanded[cat.id] !== false
        const count = cat.tags.reduce((a, t) => a + t.skills.length, 0)
        const needsCred = cat.credType === 'entra' || cat.credType === 'azure'

        return (
          <div key={cat.id} className="mb-6">
            {/* Category Header */}
            <button
              onClick={() => toggleCat(cat.id)}
              className={`flex w-full items-center gap-3 rounded-xl border ${meta.border || 'border-slate-200'} bg-white p-3.5 transition-all hover:shadow-sm mb-3`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${meta.border || 'border-slate-200'} text-xl bg-white`}
              >
                {cat.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>{count} skills</span>
                  {needsCred
                    ? <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600"><Shield size={9} /> Requires Credential</span>
                    : <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600"><Globe size={9} /> No Auth Required</span>
                  }
                </div>
              </div>
              {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isOpen && cat.tags.map(tg => (
              <div key={tg.tag} className="mb-4 ml-2">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">
                  {tg.tag} <span className="font-normal">({tg.skills.length})</span>
                </p>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tg.skills.map(sk => (
                    <button
                      key={sk.id}
                      onClick={() => setSelectedSkill({ ...sk, catId: cat.id })}
                      className="group relative rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-emerald-300 hover:shadow-sm"
                    >
                      <div className="mb-2 text-xl">{sk.icon}</div>
                      <div className="mb-1 text-[13px] font-semibold text-slate-800 leading-tight">{sk.label}</div>
                      <div className="mb-2 text-[11px] text-slate-500 leading-snug line-clamp-2">{sk.desc}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>{tg.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-sm font-semibold text-slate-400">No skills match &quot;{search}&quot;</p>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (() => {
        const cat = filtered.find(c => c.id === selectedSkill.catId)
        const meta = CATEGORY_META[selectedSkill.catId] || {}
        const badge = BADGE_CLASS[selectedSkill.catId] || 'bg-slate-100 text-slate-600'
        const needsCred = cat?.credType === 'entra' || cat?.credType === 'azure'
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5" onClick={() => setSelectedSkill(null)}>
            <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-slate-200 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${meta.border || 'border-slate-200'} text-2xl bg-white`}>
                  {selectedSkill.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-slate-800">{selectedSkill.label}</h2>
                  <p className="text-xs text-slate-500">{cat?.name}</p>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed">{selectedSkill.desc}</p>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Function Name</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-blue-700">
                    {selectedSkill.name}()
                  </div>
                </div>
                {selectedSkill.params?.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Parameters</label>
                    <div className="space-y-1.5">
                      {selectedSkill.params.map(p => (
                        <div key={p} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                          <code className="text-[11.5px] text-amber-600">{p}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`rounded-lg p-3 text-xs ${needsCred ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                  {needsCred
                    ? 'Requires Microsoft credential — Client ID + Secret + Tenant ID → OAuth2 token injected at runtime'
                    : 'No credential required — available out of the box'}
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
