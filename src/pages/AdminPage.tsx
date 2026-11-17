import { useEffect, useMemo, useState } from 'react'
import {
  deleteAdminMedia,
  getAdminMedia,
  replaceAdminMedia,
  uploadAdminMedia,
  type MediaItem,
} from '../services/api'

type DashboardData = {
  totals: { bookings: number; enquiries: number; services: number; pages: number }
  recentBookings: Array<Record<string, unknown>>
  recentEnquiries: Array<Record<string, unknown>>
}

type AdminRecord = Record<string, unknown>

const adminSections = [
  { value: 'pages', label: 'Pages', identity: 'slug' },
  { value: 'services', label: 'Services', identity: 'id' },
  { value: 'gallery', label: 'Gallery', identity: 'id' },
  { value: 'faqs', label: 'FAQs', identity: 'id' },
  { value: 'testimonials', label: 'Testimonials', identity: 'id' },
  { value: 'areas', label: 'Areas', identity: 'id' },
  { value: 'pricing', label: 'Pricing', identity: 'id' },
  { value: 'bookings', label: 'Bookings', identity: 'id' },
  { value: 'enquiries', label: 'Enquiries', identity: 'id' },
  { value: 'settings', label: 'Settings', identity: 'key' },
  { value: 'navigation', label: 'Navigation', identity: 'id' },
] as const

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const maxImageBytes = 5 * 1024 * 1024
const statusOptions = ['new', 'contacted', 'confirmed', 'completed'] as const
type StatusValue = (typeof statusOptions)[number]

function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('awo-admin-token') || '')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeResource, setActiveResource] = useState<(typeof adminSections)[number]['value']>('pages')
  const [records, setRecords] = useState<AdminRecord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [editor, setEditor] = useState(getNewRecordTemplate('pages'))
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [recordMessage, setRecordMessage] = useState('')
  const [recordError, setRecordError] = useState('')
  const [recordsForQuery, setRecordsForQuery] = useState('')

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaError, setMediaError] = useState('')
  const [mediaMessage, setMediaMessage] = useState('')
  const [mediaSearch, setMediaSearch] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadPreview, setUploadPreview] = useState<string[]>([])
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [replacePreview, setReplacePreview] = useState('')
  const [statusSaving, setStatusSaving] = useState<string | null>(null)

  const queryKey = `${activeResource}:${search}`
  const recordsLoading = recordsForQuery !== queryKey

  const loadDashboard = async (authToken: string) => {
    const response = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${authToken}` } })
    if (!response.ok) throw new Error('Your session could not be verified.')
    setDashboard((await response.json()) as DashboardData)
  }

  const handleExpiredSession = () => {
    setToken('')
    localStorage.removeItem('awo-admin-token')
    setError('Your admin session expired. Please log in again.')
  }

  const loadMedia = async (authToken: string, q = mediaSearch) => {
    setMediaLoading(true)
    setMediaError('')
    try {
      setMediaItems(await getAdminMedia(authToken, q))
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Media could not be loaded.')
    } finally {
      setMediaLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    loadDashboard(token).catch(handleExpiredSession)
    loadMedia(token).catch(() => undefined)
  }, [token])

  useEffect(() => {
    if (!token) return
    let active = true
    fetch(`/api/admin/${activeResource}?q=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Unable to load records.')
        return data as AdminRecord[]
      })
      .then((data) => {
        if (active) {
          setRecords(data)
          setSelectedId('')
          setEditor(getNewRecordTemplate(activeResource))
          setRecordError('')
          setRecordsForQuery(queryKey)
        }
      })
      .catch((loadError) => {
        if (active) {
          setRecordError(loadError instanceof Error ? loadError.message : 'Unable to load records.')
          setRecords([])
          setRecordsForQuery(queryKey)
        }
      })
    return () => { active = false }
  }, [token, activeResource, search, refreshKey, queryKey])

  const selectedRecord = records.find((r) => String(r[getResourceIdentity(activeResource)] ?? '') === selectedId)
  const parsedEditor = useMemo(() => { try { return JSON.parse(editor) as AdminRecord } catch { return null } }, [editor])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.')
      const authToken = data.token as string
      setToken(authToken)
      localStorage.setItem('awo-admin-token', authToken)
      await loadDashboard(authToken)
      await loadMedia(authToken)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setDashboard(null)
    localStorage.removeItem('awo-admin-token')
  }

  const handleSaveRecord = async (event: React.FormEvent) => {
    event.preventDefault()
    setRecordError('')
    setRecordMessage('')
    try {
      const payload = JSON.parse(editor) as AdminRecord
      const prev = selectedRecord ? getPublicationState(selectedRecord) : null
      const next = getPublicationState(payload)
      if (next !== null && next !== prev && !window.confirm(`Are you sure you want to ${next ? 'publish' : 'unpublish'} this record?`)) return
      const identity = getResourceIdentity(activeResource)
      const editingId = selectedRecord ? String(selectedRecord[identity]) : ''
      const endpoint = editingId ? `/api/admin/${activeResource}/${encodeURIComponent(editingId)}` : `/api/admin/${activeResource}`
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Unable to save record.')
      setRecordMessage('Record saved successfully to database.')
      setRefreshKey((k) => k + 1)
      loadMedia(token).catch(() => undefined)
    } catch (saveError) {
      setRecordError(saveError instanceof Error ? saveError.message : 'Enter a valid JSON record.')
    }
  }

  const handleDeleteRecord = async () => {
    if (!selectedRecord || !window.confirm('Delete this record permanently?')) return
    setRecordError('')
    setRecordMessage('')
    try {
      const identity = getResourceIdentity(activeResource)
      const id = String(selectedRecord[identity])
      const response = await fetch(`/api/admin/${activeResource}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Unable to delete record.')
      setSelectedId('')
      setEditor(getNewRecordTemplate(activeResource))
      setRecordMessage('Record deleted successfully.')
      setRefreshKey((k) => k + 1)
      loadMedia(token).catch(() => undefined)
    } catch (deleteError) {
      setRecordError(deleteError instanceof Error ? deleteError.message : 'Unable to delete record.')
    }
  }

  const handleNewRecord = () => {
    if (selectedRecord && !window.confirm('Discard unsaved edits and create a new record?')) return
    setSelectedId('')
    setEditor(getNewRecordTemplate(activeResource))
    setRecordMessage('')
    setRecordError('')
  }

  const onUploadFilesChange = (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => allowedImageTypes.includes(f.type) && f.size <= maxImageBytes)
    uploadPreview.forEach((u) => URL.revokeObjectURL(u))
    setUploadFiles(list)
    setUploadPreview(list.map((f) => URL.createObjectURL(f)))
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return
    setMediaError('')
    setMediaMessage('')
    try {
      const res = await uploadAdminMedia(token, uploadFiles)
      setMediaMessage(`${res.items.length} image(s) uploaded to wwwroot/uploads and saved in database.`)
      uploadPreview.forEach((u) => URL.revokeObjectURL(u))
      setUploadFiles([])
      setUploadPreview([])
      await loadMedia(token)
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const handleReplace = async () => {
    if (!replaceTarget || !replaceFile) return
    setMediaError('')
    setMediaMessage('')
    try {
      await replaceAdminMedia(token, replaceTarget.id, replaceFile)
      setMediaMessage('Image replaced. New file stored in wwwroot/uploads and references updated.')
      if (replacePreview) URL.revokeObjectURL(replacePreview)
      setReplaceTarget(null)
      setReplaceFile(null)
      setReplacePreview('')
      await loadMedia(token)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Replace failed.')
    }
  }

  const handleDeleteMedia = async (item: MediaItem) => {
    const inUse = (item.usage_count ?? 0) > 0
    if (!window.confirm(inUse ? `Image is used ${item.usage_count} time(s). Delete file and clear references?` : 'Delete image file and database record?')) return
    setMediaError('')
    setMediaMessage('')
    try {
      await deleteAdminMedia(token, item.id, inUse)
      setMediaMessage('Image deleted.')
      await loadMedia(token)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Delete failed.')
    }
  }

  const copyUrl = async (url: string) => {
    try { await navigator.clipboard.writeText(url); setMediaMessage(`Copied: ${url}`) }
    catch { setMediaMessage(`URL: ${url}`) }
  }

  const setEditorField = (field: string, value: string) => {
    try {
      const obj = (JSON.parse(editor) as AdminRecord) || {}
      obj[field] = value
      setEditor(JSON.stringify(obj, null, 2))
      setMediaMessage(`Set ${field}. Save record to persist.`)
    } catch {
      setMediaError('Invalid JSON in editor. Fix it before setting image URL.')
    }
  }

  const updateRecordStatus = async (resource: 'enquiries' | 'bookings', id: string, status: StatusValue) => {
    setStatusSaving(`${resource}:${id}`)
    setRecordError('')
    setRecordMessage('')
    try {
      const response = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof (result as { error?: string }).error === 'string' ? (result as { error: string }).error : 'Unable to update status.')
      setRecordMessage(`${resource === 'enquiries' ? 'Enquiry' : 'Booking'} status updated to "${status}".`)
      setRefreshKey((k) => k + 1)
      loadDashboard(token).catch(() => undefined)
    } catch (e) {
      setRecordError(e instanceof Error ? e.message : 'Unable to update status.')
    } finally {
      setStatusSaving(null)
    }
  }

  if (!token) {
    return (
      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin access</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Sign in</h1>
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
              </div>
              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Signing in...' : 'Sign in to admin'}
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }

  const imageFieldHints = activeResource === 'pages'
    ? ['heroImageUrl', 'bannerImageUrl']
    : ['services', 'gallery', 'testimonials'].includes(activeResource)
      ? ['image_url']
      : []

  return (
    <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">AWO CMS</h1>
            <p className="mt-2 text-sm text-slate-600">Manage content and images. Uploaded images are stored in <code>wwwroot/uploads</code>; only URL/path is saved in database.</p>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">Log out</button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {dashboard ? (
            <>
              <StatCard label="Bookings" value={dashboard.totals.bookings} />
              <StatCard label="New enquiries" value={dashboard.totals.enquiries} />
              <StatCard label="Published services" value={dashboard.totals.services} />
              <StatCard label="Published pages" value={dashboard.totals.pages} />
            </>
          ) : <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500">Loading dashboard...</div>}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <AdminPanel title="Recent bookings" items={dashboard?.recentBookings ?? []} />
          <AdminPanel title="Recent enquiries" items={dashboard?.recentEnquiries ?? []} />
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Content and records</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Manage site data (CRUD)</h2>
              <p className="mt-2 text-sm text-slate-600">Edit JSON and save to database. Pages support <code>heroImageUrl</code>, <code>bannerImageUrl</code>, and section <code>imageUrl</code>. Services/gallery/testimonials support <code>image_url</code>.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setActiveResource('gallery'); setSelectedId(''); setSearch(''); setRecordMessage(''); setRecordError('') }} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeResource === 'gallery' ? 'bg-amber-400 text-slate-950' : 'border border-slate-300 text-slate-700 hover:border-amber-400'}`}>Gallery manager</button>
                <button type="button" onClick={() => { setActiveResource('enquiries'); setSelectedId(''); setSearch(''); setRecordMessage(''); setRecordError('') }} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeResource === 'enquiries' ? 'bg-amber-400 text-slate-950' : 'border border-slate-300 text-slate-700 hover:border-amber-400'}`}>Contact / enquiry forms</button>
                <button type="button" onClick={() => { setActiveResource('bookings'); setSelectedId(''); setSearch(''); setRecordMessage(''); setRecordError('') }} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeResource === 'bookings' ? 'bg-amber-400 text-slate-950' : 'border border-slate-300 text-slate-700 hover:border-amber-400'}`}>Booking requests</button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-[34rem]">
              <div>
                <label htmlFor="admin-resource" className="mb-2 block text-sm font-medium text-slate-700">Record type</label>
                <select id="admin-resource" value={activeResource} onChange={(e) => { setActiveResource(e.target.value as typeof activeResource); setSelectedId(''); setRecordMessage(''); setRecordError('') }} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
                  {adminSections.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="admin-search" className="mb-2 block text-sm font-medium text-slate-700">Search records</label>
                <input id="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900" placeholder="Filter by text" />
              </div>
            </div>
          </div>

          {(activeResource === 'enquiries' || activeResource === 'bookings') ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{activeResource === 'enquiries' ? 'Contact / Enquiry forms' : 'Booking requests'}</h3>
                  <p className="text-sm text-slate-500">Track submissions and update status (saved to database).</p>
                </div>
                <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400">Refresh</button>
              </div>
              {recordsLoading ? <p className="text-sm text-slate-500">Loading records...</p> : null}
              {!recordsLoading && records.length === 0 ? <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No records found.</p> : null}
              <div className="grid gap-4 md:grid-cols-2">
                {records.map((record) => {
                  const id = String(record.id ?? '')
                  const status = String(record.status ?? 'new')
                  const saving = statusSaving === `${activeResource}:${id}`
                  return (
                    <article key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{String(record.name ?? record.full_name ?? 'Submission')}</p>
                          <p className="text-xs text-slate-500">{String(record.email ?? '')} {record.phone ? `· ${String(record.phone)}` : ''}</p>
                          {record.booking_reference ? <p className="mt-1 text-xs font-semibold text-amber-700">Ref: {String(record.booking_reference)}</p> : null}
                        </div>
                        <label className="text-xs font-semibold text-slate-700">
                          Status
                          <select value={statusOptions.includes(status as StatusValue) ? status : 'new'} disabled={saving} onChange={(e) => updateRecordStatus(activeResource, id, e.target.value as StatusValue)} className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900">
                            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        {record.lesson_type ? <p><span className="font-semibold">Lesson:</span> {String(record.lesson_type)}</p> : null}
                        {record.preferred_date ? <p><span className="font-semibold">Preferred:</span> {String(record.preferred_date)} {record.preferred_time ? String(record.preferred_time) : ''}</p> : null}
                        {record.driving_experience ? <p><span className="font-semibold">Experience:</span> {String(record.driving_experience)}</p> : null}
                        {record.message ? <p><span className="font-semibold">Message:</span> {String(record.message)}</p> : null}
                        {record.contact_preference ? <p><span className="font-semibold">Contact via:</span> {String(record.contact_preference)}</p> : null}
                        {record.created_at ? <p className="text-xs text-slate-500">Received: {String(record.created_at)}</p> : null}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{saving ? 'Updating status...' : `ID: ${id}`}</p>
                    </article>
                  )
                })}
              </div>
              {recordError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{recordError}</p> : null}
              {recordMessage ? <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{recordMessage}</p> : null}
            </div>
          ) : activeResource === 'gallery' ? (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">Gallery manager</h3>
                  <p className="text-sm text-slate-500">Add, edit, delete and reorder gallery images shown on <code>/gallery</code>. Upload image in Media Library, then set <code>image_url</code> and save.</p>
                </div>
                <button type="button" onClick={handleNewRecord} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">Add new image</button>
              </div>
              {recordsLoading ? <p className="text-sm text-slate-500">Loading gallery...</p> : null}
              {!recordsLoading && records.length === 0 ? <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No gallery images yet. Click “Add new image”, upload in Media Library, use URL, set title/sort/published and save.</p> : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((record) => {
                  const id = String(record.id ?? '')
                  const img = String(record.image_url ?? '')
                  return (
                    <article key={id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${id === selectedId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                      <div className="aspect-[4/3] bg-slate-100">
                        {img ? <img src={img} alt={String(record.alt_text ?? record.title ?? 'Gallery')} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.25' }} /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image URL</div>}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-bold text-slate-900">{String(record.title ?? `Image #${id}`)}</p>
                        <p className="mt-1 text-xs text-slate-500">Order: {String(record.sort_order ?? 0)} · {record.published ? 'Published' : 'Hidden'}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-400" title={img}>{img || 'image_url not set'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setSelectedId(id); setEditor(JSON.stringify(record, null, 2)); setRecordMessage(''); setRecordError('') }} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Edit</button>
                          <button type="button" onClick={async () => { setSelectedId(id); if (!window.confirm('Delete this gallery image record?')) return; try { const r = await fetch(`/api/admin/gallery/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); const res = await r.json(); if (!r.ok) throw new Error(typeof res.error === 'string' ? res.error : 'Delete failed'); setRecordMessage('Gallery image deleted.'); setSelectedId(''); setEditor(getNewRecordTemplate('gallery')); setRefreshKey((k)=>k+1) } catch(e){ setRecordError(e instanceof Error ? e.message : 'Delete failed') } }} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              <form onSubmit={handleSaveRecord} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">{selectedRecord ? 'Edit selected gallery item' : 'Create gallery item'}</h4>
                {parsedEditor && typeof parsedEditor.image_url === 'string' && parsedEditor.image_url ? <img src={String(parsedEditor.image_url)} alt="" className="h-36 w-full max-w-sm rounded-lg object-cover ring-1 ring-slate-200" /> : null}
                <textarea id="admin-record-json" value={editor} onChange={(e) => setEditor(e.target.value)} rows={14} spellCheck={false} className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none focus:border-amber-400" />
                {recordError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{recordError}</p> : null}
                {recordMessage ? <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{recordMessage}</p> : null}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">Save to database</button>
                  <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">Refresh</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900">Records</h3>
                  <button type="button" onClick={handleNewRecord} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">New</button>
                </div>
                <div className="mt-4 max-h-[32rem] space-y-2 overflow-auto">
                  {recordsLoading ? <p className="text-sm text-slate-500">Loading records...</p> : null}
                  {!recordsLoading && records.length === 0 ? <p className="text-sm text-slate-500">No records found.</p> : null}
                  {records.map((record, index) => {
                    const identity = getResourceIdentity(activeResource)
                    const id = String(record[identity] ?? '')
                    const label = String(record.title ?? record.question ?? record.name ?? record.customer_name ?? record.full_name ?? record.key ?? record.slug ?? id)
                    return (
                      <button type="button" key={id || index} onClick={() => { setSelectedId(id); setEditor(JSON.stringify(record, null, 2)); setRecordMessage(''); setRecordError('') }} className={`block w-full rounded-xl border p-3 text-left text-sm transition ${id === selectedId ? 'border-amber-400 bg-amber-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                        <span className="font-semibold">{label}</span>
                        <span className="mt-1 block truncate text-xs text-slate-500">{id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900">{selectedRecord ? 'Edit record' : 'Create record'}</h3>
                  {selectedRecord ? <button type="button" onClick={handleDeleteRecord} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button> : null}
                </div>
                {imageFieldHints.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold">Image fields</p>
                    <p className="mt-1 text-xs text-slate-500">Upload in Media Library, copy/use URL, then paste into JSON field and Save.</p>
                    <div className="mt-2 flex flex-wrap gap-2">{imageFieldHints.map((f) => <span key={f} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{f}</span>)}</div>
                    {parsedEditor && typeof parsedEditor.heroImageUrl === 'string' && parsedEditor.heroImageUrl ? <img src={String(parsedEditor.heroImageUrl)} alt="" className="mt-3 h-28 w-full max-w-sm rounded-lg object-cover ring-1 ring-slate-200" /> : null}
                    {parsedEditor && typeof parsedEditor.image_url === 'string' && parsedEditor.image_url ? <img src={String(parsedEditor.image_url)} alt="" className="mt-3 h-28 w-full max-w-sm rounded-lg object-cover ring-1 ring-slate-200" /> : null}
                  </div>
                ) : null}
                <textarea id="admin-record-json" value={editor} onChange={(e) => setEditor(e.target.value)} rows={20} spellCheck={false} className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none focus:border-amber-400" />
                {recordError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{recordError}</p> : null}
                {recordMessage ? <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{recordMessage}</p> : null}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">Save record</button>
                  <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">Refresh</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Media library</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Upload & manage images</h2>
              <p className="mt-2 text-sm text-slate-600">Files are uploaded to <code>wwwroot/uploads/YYYY/MM/</code>. Database stores only URL/path. Allowed: JPG, PNG, WebP, SVG (max 5MB).</p>
            </div>
            <div className="flex gap-2">
              <input value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} placeholder="Search filename/url" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm" />
              <button type="button" onClick={() => loadMedia(token, mediaSearch)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-slate-400">Search</button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">Upload images</h3>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => onUploadFilesChange(e.target.files)} className="mt-3 block w-full text-sm" />
              {uploadPreview.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadPreview.map((src, i) => <img key={i} src={src} alt="preview" className="h-20 w-full rounded-lg object-cover ring-1 ring-slate-200" />)}
                </div>
              ) : <p className="mt-3 text-xs text-slate-500">Select images to see preview before upload.</p>}
              <button type="button" onClick={handleUpload} disabled={uploadFiles.length === 0} className="mt-4 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50">Upload to server & save in DB</button>

              {replaceTarget ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-900">Replace: {replaceTarget.original_name || replaceTarget.filename}</p>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    if (replacePreview) URL.revokeObjectURL(replacePreview)
                    setReplaceFile(f)
                    setReplacePreview(f ? URL.createObjectURL(f) : '')
                  }} className="mt-2 block w-full text-sm" />
                  {replacePreview ? <img src={replacePreview} alt="replace preview" className="mt-2 h-24 w-full max-w-xs rounded-lg object-cover" /> : null}
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={handleReplace} disabled={!replaceFile} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Replace image</button>
                    <button type="button" onClick={() => { if (replacePreview) URL.revokeObjectURL(replacePreview); setReplaceTarget(null); setReplaceFile(null); setReplacePreview('') }} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold">Cancel</button>
                  </div>
                </div>
              ) : null}

              {mediaError ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{mediaError}</p> : null}
              {mediaMessage ? <p aria-live="polite" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{mediaMessage}</p> : null}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Library ({mediaItems.length})</h3>
                {mediaLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
              </div>
              <div className="mt-3 grid max-h-[32rem] gap-3 overflow-auto sm:grid-cols-2">
                {mediaItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <img src={item.url} alt={item.alt_text || item.original_name} className="h-28 w-full rounded-lg object-cover bg-slate-100" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }} />
                    <p className="mt-2 truncate text-xs font-semibold text-slate-800" title={item.original_name}>{item.original_name || item.filename}</p>
                    <p className="truncate text-[11px] text-slate-500" title={item.url}>{item.url}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.mime_type || 'image'} · {Math.round((item.file_size || 0) / 1024)} KB · uses: {item.usage_count ?? 0}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button type="button" onClick={() => copyUrl(item.url)} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold hover:bg-slate-200">Copy URL</button>
                      <button type="button" onClick={() => { setReplaceTarget(item); setReplaceFile(null); setReplacePreview('') }} className="rounded bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200">Replace</button>
                      <button type="button" onClick={() => handleDeleteMedia(item)} className="rounded bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-200">Delete</button>
                      {activeResource === 'pages' ? <>
                        <button type="button" onClick={() => setEditorField('heroImageUrl', item.url)} className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Use as hero</button>
                        <button type="button" onClick={() => setEditorField('bannerImageUrl', item.url)} className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Use as banner</button>
                      </> : null}
                      {['services', 'gallery', 'testimonials'].includes(activeResource) ? (
                        <button type="button" onClick={() => setEditorField('image_url', item.url)} className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Use in record</button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {!mediaLoading && mediaItems.length === 0 ? <p className="text-sm text-slate-500">No images uploaded yet.</p> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function getResourceIdentity(resource: (typeof adminSections)[number]['value']) {
  return adminSections.find((section) => section.value === resource)?.identity ?? 'id'
}

function getNewRecordTemplate(resource: (typeof adminSections)[number]['value']) {
  const templates: Record<(typeof adminSections)[number]['value'], object> = {
    pages: { slug: '', title: '', description: '', seoTitle: '', metaDescription: '', status: 'draft', heroImageUrl: '', heroImageAlt: '', bannerImageUrl: '', bannerImageAlt: '', sections: [{ heading: '', body: '', items: [], imageUrl: '', imageAlt: '' }] },
    services: { slug: '', title: '', summary: '', description: '', status: 'draft', image_url: '', image_alt: '' },
    gallery: { title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true },
    faqs: { question: '', answer: '', published: false },
    testimonials: { customer_name: '', quote: '', verified: false, image_url: '', image_alt: '' },
    areas: { name: '', description: '', published: false },
    pricing: { name: '', description: '', price: '', status: 'draft' },
    bookings: { full_name: '', phone: '', email: '', driving_experience: '', lesson_type: '', preferred_date: '', preferred_time: '', contact_preference: 'Email', message: '', status: 'new' },
    enquiries: { name: '', email: '', phone: '', message: '', status: 'new' },
    settings: { key: '', value: '', description: '' },
    navigation: { label: '', href: '/', parent_id: null, sort_order: 0, published: true },
  }
  return JSON.stringify(templates[resource], null, 2)
}

function getPublicationState(record: AdminRecord): boolean | null {
  if (typeof record.status === 'string') return record.status === 'published'
  if (typeof record.published === 'boolean') return record.published
  if (typeof record.verified === 'boolean') return record.verified
  return null
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function AdminPanel({ title, items }: { title: string; items: Array<Record<string, unknown>> }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">No records available yet.</p> : items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {Object.entries(item).slice(0, 4).map(([key, value]) => (
              <p key={key} className="mb-1"><span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPage
