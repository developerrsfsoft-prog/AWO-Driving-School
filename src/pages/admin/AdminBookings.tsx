import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

type Item = Record<string, any>
type Ctx = { token: string; onExpired: () => void }
const statuses = ['new', 'contacted', 'confirmed', 'completed']

export default function AdminBookings() {
  const { token, onExpired } = useOutletContext<Ctx>()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } })
      if (r.status === 401) { onExpired(); return }
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      setItems(j)
    } catch (e) { setErr((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    setSaving(String(id)); setErr(''); setMsg('')
    try {
      const r = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.status === 401) { onExpired(); return }
      if (!r.ok) throw new Error(j.error || 'Failed')
      setMsg('Status updated.')
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
    } catch (e) { setErr((e as Error).message) } finally { setSaving(null) }
  }

return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">Track booking requests and update status.</p>
      </div>
      {msg ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p> : null}
      {err ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">No bookings yet.</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{item.full_name}</p>
                <p className="text-sm text-slate-500">{item.email} · {item.phone}</p>
                {item.booking_reference ? <p className="text-xs font-semibold text-amber-700">Ref: {item.booking_reference}</p> : null}
              </div>
              <select value={item.status || 'new'} disabled={saving === String(item.id)} onChange={(e) => updateStatus(item.id, e.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm font-medium">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {item.lesson_type ? <p><span className="font-semibold">Lesson:</span> {item.lesson_type}</p> : null}
              {item.preferred_date ? <p><span className="font-semibold">Preferred:</span> {item.preferred_date} {item.preferred_time || ''}</p> : null}
              {item.driving_experience ? <p><span className="font-semibold">Experience:</span> {item.driving_experience}</p> : null}
              {item.message ? <p><span className="font-semibold">Message:</span> {item.message}</p> : null}
            </div>
            <p className="mt-2 text-xs text-slate-400">ID: {item.id} · {item.created_at ? String(item.created_at) : ''}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
