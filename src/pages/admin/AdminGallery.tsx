import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { deleteAdminMedia, getAdminMedia, uploadAdminMedia, type MediaItem } from '../../services/api'

type GalleryItem = { id: number; title: string; description: string; image_url: string; alt_text: string; sort_order: number; published: boolean }
type Ctx = { token: string; onExpired: () => void }
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const maxBytes = 5 * 1024 * 1024

export default function AdminGallery() {
  const { token, onExpired } = useOutletContext<Ctx>()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const api = async (path: string, init?: RequestInit) => {
    const r = await fetch(path, { ...init, headers: { ...authHeaders, ...(init?.headers || {}) } })
    if (r.status === 401) { onExpired(); throw new Error('Session expired') }
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error((j as any).error || 'Request failed')
    return j
  }

  const load = async () => {
    setLoading(true)
    setErr('')
    try {
      const [g, m] = await Promise.all([
        api('/api/admin/gallery'),
        getAdminMedia(token).catch(() => [] as MediaItem[]),
      ])
      setItems((g as any[]).map((x) => ({ ...x, published: Boolean(x.published) })))
      setMedia(m as MediaItem[])
    } catch (e) {
      if ((e as Error).message !== 'Session expired') setErr((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onFilePick = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!allowed.includes(file.type) || file.size > maxBytes) {
      setErr('Select a JPG, PNG, WebP or SVG image (max 5MB).')
      return
    }
    setUploading(true)
    setErr('')
    setMsg('')
    try {
      const up = await uploadAdminMedia(token, [file], form.alt_text || form.title)
      const url = up.item?.url || up.items?.[0]?.url
      if (!url) throw new Error('Upload did not return image URL.')
      setForm((f) => ({ ...f, image_url: url, alt_text: f.alt_text || file.name.replace(/\.[^.]+$/, '') }))
      const title = (form.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')).trim()
      await api('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({ title, description: form.description, image_url: url, alt_text: form.alt_text || title, sort_order: Number(form.sort_order) || 0, published: form.published }),
      })
      setMsg('Image uploaded to wwwroot/uploads and saved to database.')
      setForm({ title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true })
      setShowUpload(false)
      await load()
    } catch (e) {
      setErr((e as Error).message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const saveEdit = async () => {
    if (editingId == null) return
    setErr(''); setMsg('')
    try {
      await api(`/api/admin/gallery/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: form.title, description: form.description, image_url: form.image_url, alt_text: form.alt_text, sort_order: Number(form.sort_order) || 0, published: form.published }),
      })
      setMsg('Gallery image updated.')
      setEditingId(null)
      setForm({ title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true })
      await load()
    } catch (e) { setErr((e as Error).message) }
  }

  const remove = async (item: GalleryItem) => {
    if (!window.confirm('Delete this gallery image from database?')) return
    setErr(''); setMsg('')
    try {
      await api(`/api/admin/gallery/${item.id}`, { method: 'DELETE' })
      // also try delete media file if it was in uploads and unused (best effort)
      const m = media.find((x) => x.url === item.image_url)
      if (m && (m.usage_count ?? 0) <= 1) {
        try { await deleteAdminMedia(token, m.id, true) } catch {}
      }
      setMsg('Gallery image deleted.')
      if (editingId === item.id) { setEditingId(null); setForm({ title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true }) }
      await load()
    } catch (e) { setErr((e as Error).message) }
  }

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setForm({ title: item.title || '', description: item.description || '', image_url: item.image_url || '', alt_text: item.alt_text || '', sort_order: item.sort_order || 0, published: item.published })
    setShowUpload(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gallery</h1>
          <p className="mt-1 text-sm text-slate-600">Upload new images and manage all gallery images stored in database. Files save to <code>wwwroot/uploads</code>.</p>
        </div>
        <button type="button" onClick={() => { setShowUpload((v) => !v); setEditingId(null) }} className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300">
          {showUpload ? 'Close upload' : 'Upload image'}
        </button>
      </div>

      {msg ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p> : null}
      {err ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</p> : null}

      {showUpload ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Upload new gallery image</h2>
          <p className="mt-1 text-sm text-slate-500">Choose an image file. It will be uploaded to server and added to gallery database automatically.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Image title" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Short description" />
            </div>
            <div className="flex items-center gap-2">
              <input id="pub" type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4" />
              <label htmlFor="pub" className="text-sm font-medium text-slate-700">Published (show on website)</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Image file</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" disabled={uploading} onChange={(e) => onFilePick(e.target.files)} className="block w-full text-sm" />
            {uploading ? <p className="mt-2 text-sm text-amber-700">Uploading and saving...</p> : null}
          </div>
        </div>
      ) : null}

      {editingId != null ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Edit gallery image #{editingId}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Sort order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" /></div>
            <div className="flex items-center gap-2"><input id="pub2" type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /><label htmlFor="pub2" className="text-sm font-medium text-slate-700">Published</label></div>
          </div>
          {form.image_url ? <img src={form.image_url} alt="" className="mt-3 h-36 rounded-xl object-cover ring-1 ring-slate-200" /> : null}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={saveEdit} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white">Save changes</button>
            <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', description: '', image_url: '', alt_text: '', sort_order: 0, published: true }) }} className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-lg font-bold text-slate-900">All gallery images ({items.length})</h2>
        <p className="text-sm text-slate-500">Images from database shown on the public gallery page.</p>
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No gallery images in database yet. Use “Upload image” to add.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-slate-100">
              {item.image_url ? <img src={item.image_url} alt={item.alt_text || item.title || 'Gallery'} className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }} /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-bold text-slate-900">{item.title || `Image #${item.id}`}</p>
              <p className="mt-0.5 text-xs text-slate-500">Order: {item.sort_order} · {item.published ? 'Published' : 'Hidden'}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400" title={item.image_url}>{item.image_url}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Edit</button>
                <button type="button" onClick={() => remove(item)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
