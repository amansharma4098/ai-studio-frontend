'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Bot, Send, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { agentsApi, skillsApi, credentialsApi } from '@/lib/api'

interface SkillBinding { skillId: string; skillName: string; credentialId: string | null }

export default function AgentsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<null | 'create' | { type: 'chat'; agentId: string }>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', description: '', system_prompt: 'You are a helpful Microsoft 365 and Azure assistant.', model_name: 'llama3', temperature: 0.7, memory_enabled: true, skill_bindings: [] as SkillBinding[] })
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState<{ role: string; content: string }[]>([])
  const [running, setRunning] = useState(false)

  const { data: agents = [] } = useQuery({ queryKey: ['agents'], queryFn: () => agentsApi.list().then(r => r.data) })
  const { data: catalog = [] } = useQuery({ queryKey: ['skills-catalog'], queryFn: () => skillsApi.getCatalog().then(r => r.data) })
  const { data: credentials = [] } = useQuery({ queryKey: ['credentials'], queryFn: () => credentialsApi.list().then(r => r.data) })

  const allSkills = (catalog as any[]).flatMap((c: any) => c.tags.flatMap((t: any) => t.skills.map((s: any) => ({ ...s, catId: c.id, catName: c.name, credType: c.credType }))))

  const createMut = useMutation({
    mutationFn: (data: any) => agentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agents'] }); setModal(null); setStep(1); setForm({ name: '', description: '', system_prompt: 'You are a helpful Microsoft 365 and Azure assistant.', model_name: 'llama3', temperature: 0.7, memory_enabled: true, skill_bindings: [] }) },
  })

  const deleteMut = useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })

  const toggleSkill = (sk: any) => {
    const exists = form.skill_bindings.find(b => b.skillId === sk.id)
    if (exists) setForm({ ...form, skill_bindings: form.skill_bindings.filter(b => b.skillId !== sk.id) })
    else setForm({ ...form, skill_bindings: [...form.skill_bindings, { skillId: sk.id, skillName: sk.name, credentialId: null }] })
  }

  const bindCred = (skillId: string, credId: string) => {
    setForm({ ...form, skill_bindings: form.skill_bindings.map(b => b.skillId === skillId ? { ...b, credentialId: credId || null } : b) })
  }

  const sendChat = async () => {
    if (!chatInput.trim() || running || (modal as any)?.type !== 'chat') return
    const agentId = (modal as any).agentId
    const userMsg = chatInput
    setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', content: userMsg }])
    setRunning(true)
    try {
      const resp = await agentsApi.run(agentId, userMsg)
      setChatMsgs(m => [...m, { role: 'assistant', content: resp.data.output_text || 'No response' }])
    } catch {
      setChatMsgs(m => [...m, { role: 'assistant', content: 'Error: Agent execution failed. Check that Ollama is running.' }])
    } finally { setRunning(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agents</h1>
          <p className="mt-1 text-sm text-slate-500">LangChain ReAct agents with skill and credential bindings</p>
        </div>
        <button onClick={() => { setModal('create'); setStep(1) }} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
          <Plus size={14} /> New Agent
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(agents as any[]).map((agent: any) => (
          <div key={agent.id} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
            onClick={() => { setModal({ type: 'chat', agentId: agent.id }); setChatMsgs([{ role: 'assistant', content: `Hi! I'm ${agent.name}. How can I help you?` }]) }}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-xl">🤖</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                  <p className="text-[11px] text-slate-500">{agent.description || 'No description'}</p>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteMut.mutate(agent.id) }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
            <div className="mb-3 flex gap-1.5 flex-wrap">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{agent.model_name}</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">temp {agent.temperature}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${agent.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{agent.is_active ? 'active' : 'inactive'}</span>
            </div>
            <p className="text-[11px] text-emerald-500 font-medium">Click to chat →</p>
          </div>
        ))}
      </div>

      {/* Create Agent Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5" onClick={() => setModal(null)}>
          <div className="flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Create New Agent</h2>
                <div className="mt-2 flex items-center gap-1.5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="flex items-center gap-1.5">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-emerald-500 text-white' : 'border border-slate-300 text-slate-400'}`}>
                        {step > n ? '✓' : n}
                      </div>
                      {n < 3 && <div className={`h-px w-8 ${step > n ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-slate-500">{['', 'Configure', 'Attach Skills', 'Review'][step]}</span>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {step === 1 && (
                <div className="space-y-4">
                  {[{ k: 'name', l: 'Agent Name', ph: 'Azure Monitor Bot' }, { k: 'description', l: 'Description', ph: 'What does this agent do?' }].map(f => (
                    <div key={f.k}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{f.l}</label>
                      <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder={f.ph} value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">System Prompt</label>
                    <textarea rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      value={form.system_prompt} onChange={e => setForm({ ...form, system_prompt: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Model</label>
                      <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                        value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })}>
                        <option value="llama3">Llama 3</option>
                        <option value="mistral">Mistral 7B</option>
                        <option value="gemma">Gemma</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Temperature ({form.temperature})</label>
                      <input type="range" min="0" max="2" step="0.1" className="w-full mt-2 accent-emerald-500" value={form.temperature}
                        onChange={e => setForm({ ...form, temperature: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                    Next: Attach Skills →
                  </button>
                </div>
              )}
              {step === 2 && (
                <div>
                  <p className="mb-4 text-sm text-slate-500">Select skills and bind a credential for Microsoft skills.</p>
                  {(catalog as any[]).map((cat: any) => (
                    <div key={cat.id} className="mb-5">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <span>{cat.icon}</span>{cat.name}
                        <span className="ml-auto text-xs text-emerald-500">{form.skill_bindings.filter(b => allSkills.find(s => s.id === b.skillId)?.catId === cat.id).length} selected</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.tags.flatMap((t: any) => t.skills).slice(0, 8).map((sk: any) => {
                          const isAdded = form.skill_bindings.some(b => b.skillId === sk.id)
                          const binding = form.skill_bindings.find(b => b.skillId === sk.id)
                          const needsCred = cat.credType === 'azure' || cat.credType === 'entra'
                          const compatCreds = (credentials as any[]).filter((c: any) => c.credential_type === cat.credType && c.is_verified)
                          return (
                            <div key={sk.id} className={`rounded-lg border p-2.5 transition-all ${isAdded ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 cursor-pointer'}`}
                              onClick={() => !isAdded && toggleSkill(sk)}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span>{sk.icon}</span>
                                <span className="text-[11.5px] font-semibold text-slate-700 flex-1">{sk.label}</span>
                                {isAdded && <button onClick={e => { e.stopPropagation(); toggleSkill(sk) }} className="text-slate-400 hover:text-red-500 text-xs">✕</button>}
                              </div>
                              {isAdded && needsCred && (
                                <select onClick={e => e.stopPropagation()} className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:outline-none"
                                  value={binding?.credentialId || ''} onChange={e => bindCred(sk.id, e.target.value)}>
                                  <option value="">Bind credential...</option>
                                  {compatCreds.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  {compatCreds.length === 0 && <option disabled>No {cat.credType} credential</option>}
                                </select>
                              )}
                              {isAdded && !needsCred && <span className="text-[10px] text-emerald-600">No auth needed</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">← Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                      Review ({form.skill_bindings.length} skills) →
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    {[['Name', form.name || '(unnamed)'], ['Model', form.model_name], ['Temperature', form.temperature]].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between text-sm py-1 border-b border-slate-200 last:border-0">
                        <span className="text-slate-500">{k}</span><strong className="text-slate-800">{v as any}</strong>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Skills & Credentials ({form.skill_bindings.length})</label>
                    <div className="space-y-1.5">
                      {form.skill_bindings.map(b => {
                        const sk = allSkills.find(s => s.id === b.skillId)
                        const cred = (credentials as any[]).find((c: any) => c.id === b.credentialId)
                        const needsCred = sk?.credType === 'azure' || sk?.credType === 'entra'
                        return sk ? (
                          <div key={b.skillId} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${needsCred && !cred ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                            <span>{sk.icon}</span><span className="flex-1 font-medium text-slate-700">{sk.label}</span>
                            {cred ? <span className="text-[10.5px] text-emerald-600">{(cred as any).name}</span> : needsCred ? <span className="text-[10px] text-red-500">No credential</span> : <span className="text-[10px] text-slate-400">No auth</span>}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(2)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">← Back</button>
                    <button
                      onClick={() => createMut.mutate({ ...form, skill_bindings: form.skill_bindings.map(b => ({ skill_id: b.skillId, skill_name: b.skillName, credential_id: b.credentialId })) })}
                      disabled={createMut.isPending}
                      className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {createMut.isPending ? <><Loader2 size={13} className="animate-spin" />Creating...</> : 'Create Agent'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {modal && typeof modal === 'object' && modal.type === 'chat' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5" onClick={() => setModal(null)}>
          <div className="flex w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-xl" style={{ height: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <span className="text-2xl">🤖</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{(agents as any[]).find((a: any) => a.id === (modal as any).agentId)?.name}</p>
                <p className="text-[11px] text-slate-500">LangChain ReAct · Ollama</p>
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm font-mono text-[12px]'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {running && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-500">
                    <Loader2 size={13} className="animate-spin" /> Executing skills via LangChain...
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-slate-200 p-3">
              <input className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ask your agent..." value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()} />
              <button onClick={sendChat} disabled={running} className="rounded-lg bg-emerald-500 px-3 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
