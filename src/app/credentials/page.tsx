'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, X, Loader2, RefreshCw, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { credentialsApi } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────
interface AuthType {
  id: string
  name: string
  categories: { id: string; name: string; fields: FieldDef[] }[]
}

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'password'
  required: boolean
  placeholder?: string
}

interface Credential {
  id: string
  name: string
  auth_type: string
  auth_category: string
  description?: string
  created_by: string
  created_at: string
  modified_by: string
  modified_at: string
}

// ── Helpers ──────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Main Page ────────────────────────────────────────────────────
export default function CredentialsPage() {
  const qc = useQueryClient()

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal state
  const [addModal, setAddModal] = useState(false)
  const [viewModal, setViewModal] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ── Queries ──────────────────────────────────────────────────
  const { data: credentials = [], isLoading, refetch } = useQuery<Credential[]>({
    queryKey: ['credentials-list'],
    queryFn: () => credentialsApi.list().then(r => r.data),
  })

  const filtered = credentials.filter(c => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return true // backend can add is_active field
    return false
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => credentialsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials-list'] }); setDeleteConfirm(null) },
  })

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(c => c.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Credentials</h1>
        <p className="mt-1 text-sm text-slate-500">Manage API keys and service connections</p>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <button
          onClick={() => setStatusFilter('all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => refetch()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw size={13} /> Refresh
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Credential Details ({filtered.length})
          </span>
          <button
            onClick={() => { setEditId(null); setAddModal(true) }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Credentials
          </button>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="w-10 px-2 py-3" />
                <th className="w-10 px-2 py-3" />
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Modified By</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Modified Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">View Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 size={20} className="mx-auto animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-400">Loading credentials...</p>
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="text-4xl mb-2">🔑</div>
                    <p className="text-sm font-medium text-slate-500">No credentials yet</p>
                    <p className="mt-1 text-xs text-slate-400">Click "Add Credentials" to get started</p>
                  </td>
                </tr>
              )}
              {filtered.map(cred => (
                <tr key={cred.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(cred.id)}
                      onChange={() => toggleOne(cred.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <button
                      onClick={() => { setEditId(cred.id); setAddModal(true) }}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <button
                      onClick={() => setDeleteConfirm(cred.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <X size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{cred.name}</td>
                  <td className="px-4 py-3 text-slate-600">{cred.created_by || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(cred.created_at)}</td>
                  <td className="px-4 py-3 text-slate-600">{cred.modified_by || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(cred.modified_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewModal(cred.id)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline transition-colors"
                    >
                      View Credentials
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {addModal && (
        <AddEditModal
          editId={editId}
          credentials={credentials}
          onClose={() => { setAddModal(false); setEditId(null) }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['credentials-list'] }); setAddModal(false); setEditId(null) }}
        />
      )}

      {/* View Modal */}
      {viewModal && (
        <ViewModal credId={viewModal} onClose={() => setViewModal(null)} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Delete this credential?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone. The credential and its stored values will be permanently removed.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteMut.isPending ? <><Loader2 size={13} className="animate-spin" /> Deleting...</> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ══════════════════════════════════════════════════════════════════
function AddEditModal({
  editId,
  credentials,
  onClose,
  onSaved,
}: {
  editId: string | null
  credentials: Credential[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!editId

  // Form state
  const [name, setName] = useState('')
  const [authType, setAuthType] = useState('')
  const [authCategory, setAuthCategory] = useState('')
  const [description, setDescription] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [fieldsVisible, setFieldsVisible] = useState(false)

  // Fetch auth types on mount
  const { data: authTypes = [] } = useQuery<AuthType[]>({
    queryKey: ['auth-types'],
    queryFn: () => credentialsApi.getAuthTypes().then(r => r.data),
  })

  // Categories for selected auth type
  const selectedType = authTypes.find(t => t.id === authType)
  const categories = selectedType?.categories || []
  const selectedCategory = categories.find(c => c.id === authCategory)
  const fields: FieldDef[] = selectedCategory?.fields || []

  // Pre-fill on edit
  useEffect(() => {
    if (isEdit && editId) {
      const cred = credentials.find(c => c.id === editId)
      if (cred) {
        setName(cred.name)
        setAuthType(cred.auth_type)
        setAuthCategory(cred.auth_category)
        setDescription(cred.description || '')
      }
      // Fetch existing values
      credentialsApi.getValues(editId).then(r => {
        if (r.data && typeof r.data === 'object') {
          setFieldValues(r.data)
        }
      }).catch(() => {})
    }
  }, [editId, isEdit, credentials])

  // Reset category when auth type changes
  useEffect(() => {
    if (!isEdit) {
      setAuthCategory('')
      setFieldValues({})
      setFieldsVisible(false)
    }
  }, [authType, isEdit])

  // Animate fields in when both type + category selected
  useEffect(() => {
    if (authType && authCategory && fields.length > 0) {
      const t = setTimeout(() => setFieldsVisible(true), 50)
      return () => clearTimeout(t)
    } else {
      setFieldsVisible(false)
    }
  }, [authType, authCategory, fields.length])

  const saveMut = useMutation({
    mutationFn: (data: any) =>
      isEdit ? credentialsApi.update(editId!, data) : credentialsApi.save(data),
    onSuccess: () => onSaved(),
  })

  const handleSubmit = () => {
    saveMut.mutate({
      name,
      auth_type: authType,
      auth_category: authCategory,
      description,
      values: fieldValues,
    })
  }

  const togglePasswordVis = (key: string) =>
    setShowPasswords(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            {isEdit ? 'Edit Credential' : 'Add Credentials'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Row 1: Name | Auth Type | Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                NAME <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Production API Key"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                AUTH TYPE <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={authType}
                onChange={e => setAuthType(e.target.value)}
              >
                <option value="">Select auth type...</option>
                {authTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                AUTHTYPE CATEGORY <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                value={authCategory}
                onChange={e => setAuthCategory(e.target.value)}
                disabled={!authType}
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DESCRIPTION
              </label>
              <span className={`text-[10px] font-medium ${description.length > 255 ? 'text-red-500' : 'text-slate-400'}`}>
                {description.length}/255
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={255}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional description for this credential..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Dynamic Fields */}
          {fields.length > 0 && (
            <div
              className="space-y-4 transition-all duration-300 ease-out"
              style={{
                opacity: fieldsVisible ? 1 : 0,
                transform: fieldsVisible ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  {selectedType?.name} / {selectedCategory?.name} Fields
                </p>
              </div>
              {fields.map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      placeholder={field.placeholder || ''}
                      value={fieldValues[field.key] || ''}
                      onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVis(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMut.isPending || !name.trim() || !authType || !authCategory}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saveMut.isPending
              ? <><Loader2 size={13} className="animate-spin" /> {isEdit ? 'Updating...' : 'Saving...'}</>
              : isEdit ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// VIEW MODAL
// ══════════════════════════════════════════════════════════════════
function ViewModal({ credId, onClose }: { credId: string; onClose: () => void }) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const { data: credValues, isLoading } = useQuery({
    queryKey: ['cred-values', credId],
    queryFn: () => credentialsApi.getValues(credId).then(r => r.data),
  })

  const { data: allCreds = [] } = useQuery<Credential[]>({
    queryKey: ['credentials-list'],
    queryFn: () => credentialsApi.list().then(r => r.data),
  })

  const cred = allCreds.find((c: any) => c.id === credId)

  const togglePasswordVis = (key: string) =>
    setShowPasswords(p => ({ ...p, [key]: !p[key] }))

  // Separate metadata from secret values
  const metaFields = ['auth_type', 'auth_category', 'description', 'created_by', 'created_at']
  const secretEntries = credValues
    ? Object.entries(credValues).filter(([k]) => !metaFields.includes(k) && k !== 'id' && k !== 'name')
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">View Credentials</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 size={20} className="mx-auto animate-spin text-slate-400" />
              <p className="mt-2 text-sm text-slate-400">Loading...</p>
            </div>
          ) : (
            <>
              {/* Info fields */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                {[
                  ['Name', cred?.name || credValues?.name || '—'],
                  ['Auth Type', cred?.auth_type || credValues?.auth_type || '—'],
                  ['Category', cred?.auth_category || credValues?.auth_category || '—'],
                  ['Description', cred?.description || credValues?.description || '—'],
                  ['Created By', cred?.created_by || credValues?.created_by || '—'],
                  ['Created At', cred?.created_at ? fmtDate(cred.created_at) : '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm py-1 border-b border-slate-200 last:border-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">{value as string}</span>
                  </div>
                ))}
              </div>

              {/* Secret values */}
              {secretEntries.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Stored Values</p>
                  <div className="space-y-3">
                    {secretEntries.map(([key, val]) => {
                      const isPassword = key.toLowerCase().includes('secret') ||
                        key.toLowerCase().includes('password') ||
                        key.toLowerCase().includes('token') ||
                        key.toLowerCase().includes('api_key') ||
                        key.toLowerCase().includes('key')
                      const show = showPasswords[key]
                      return (
                        <div key={key}>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <div className="relative">
                            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 font-mono pr-10">
                              {isPassword && !show
                                ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
                                : (val as string) || '—'}
                            </div>
                            {isPassword && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVis(key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {show ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
