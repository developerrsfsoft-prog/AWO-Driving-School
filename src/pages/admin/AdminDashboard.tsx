import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Images,
  Layers,
  Mail,
  RefreshCw,
  Users,
} from 'lucide-react'

type DashboardData = {
  totals: { bookings: number; enquiries: number; services: number; pages: number }
  recentBookings: Array<Record<string, unknown>>
  recentEnquiries: Array<Record<string, unknown>>
}
type Ctx = { token: string; onExpired: () => void }

const statCards = [
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck, ring: 'ring-emerald-100', iconBg: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  { key: 'enquiries', label: 'Enquiries', icon: Mail, ring: 'ring-sky-100', iconBg: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500' },
  { key: 'services', label: 'Services', icon: Layers, ring: 'ring-violet-100', iconBg: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
  { key: 'pages', label: 'Pages', icon: Users, ring: 'ring-amber-100', iconBg: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
] as const

const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 ring-blue-200',
  contacted: 'bg-amber-100 text-amber-800 ring-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  completed: 'bg-slate-200 text-slate-700 ring-slate-300',
}

function statusClass(status: unknown) {
  return statusStyles[String(status ?? 'new')] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
}

function shortDate(value: unknown) {
  const raw = String(value ?? '')
  if (!raw) return ''
  const parsed = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 16)
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
}

export default function AdminDashboard() {
  const { token, onExpired } = useOutletContext<Ctx>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) { onExpired(); throw new Error('Session expired') }
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Unable to load dashboard.')
        return j as DashboardData
      })
      .then((d) => setData(d))
      .catch((e) => { if (e.message !== 'Session expired') setError(e.message) })
      .finally(() => setLoading(false))
  }, [token, onExpired])

  useEffect(() => { load() }, [load])

  const totals = data?.totals
  const recentBookings = data?.recentBookings ?? []
  const recentEnquiries = data?.recentEnquiries ?? []

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">Overview</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Bookings, enquiries and website content at a glance.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, ring, iconBg, bar }) => (
          <div key={key} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-inset ${ring} transition hover:-translate-y-0.5 hover:shadow-md sm:p-5`}>
            <span className={`absolute inset-x-0 top-0 h-1 ${bar} opacity-80`} />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black leading-none text-slate-900">{totals ? totals[key] : '—'}</p>
              </div>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent records */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CalendarCheck className="h-4 w-4" /></span>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Recent bookings</h2>
            </div>
            <Link to="/admin/bookings" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-600">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading && recentBookings.length === 0 ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : null}
            {!loading && recentBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No bookings yet.</p>
            ) : null}
            {recentBookings.map((item, i) => (
              <article key={String(item.id ?? i)} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-emerald-200 hover:bg-white sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{String(item.full_name ?? 'Booking')}</p>
                    <p className="truncate text-xs text-slate-500">{String(item.email ?? '')}{item.phone ? ` · ${String(item.phone)}` : ''}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusClass(item.status)}`}>
                    {String(item.status ?? 'new')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  {item.lesson_type ? <span className="font-semibold text-slate-700">{String(item.lesson_type)}</span> : null}
                  {item.preferred_date ? <span>{String(item.preferred_date)}{item.preferred_time ? ` · ${String(item.preferred_time)}` : ''}</span> : null}
                  {item.created_at ? <span className="text-slate-400">{shortDate(item.created_at)}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><Mail className="h-4 w-4" /></span>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Recent enquiries</h2>
            </div>
            <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-600">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading && recentEnquiries.length === 0 ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : null}
            {!loading && recentEnquiries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No enquiries yet.</p>
            ) : null}
            {recentEnquiries.map((item, i) => (
              <article key={String(item.id ?? i)} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-sky-200 hover:bg-white sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{String(item.name ?? 'Enquiry')}</p>
                    <p className="truncate text-xs text-slate-500">{String(item.email ?? '')}{item.phone ? ` · ${String(item.phone)}` : ''}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${statusClass(item.status)}`}>
                    {String(item.status ?? 'new')}
                  </span>
                </div>
                {item.message ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{String(item.message)}</p> : null}
                {item.created_at ? <p className="mt-2 text-[11px] text-slate-400">{shortDate(item.created_at)}</p> : null}
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { to: '/admin/gallery', label: 'Manage gallery', hint: 'Upload & edit images', icon: Images, accent: 'text-violet-700 bg-violet-50' },
          { to: '/admin/enquiries', label: 'Enquiries', hint: 'Track contact forms', icon: Mail, accent: 'text-sky-700 bg-sky-50' },
          { to: '/admin/bookings', label: 'Bookings', hint: 'Update booking status', icon: CalendarCheck, accent: 'text-emerald-700 bg-emerald-50' },
        ].map(({ to, label, hint, icon: Icon, accent }) => (
          <Link key={to} to={to} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900">{label}</span>
              <span className="block truncate text-xs text-slate-500">{hint}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
          </Link>
        ))}
      </div>
    </div>
  )
}
