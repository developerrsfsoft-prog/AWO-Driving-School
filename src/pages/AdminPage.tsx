import { useEffect, useState } from 'react'

type DashboardData = {
  totals: {
    bookings: number
    enquiries: number
    services: number
    pages: number
  }
  recentBookings: Array<Record<string, unknown>>
  recentEnquiries: Array<Record<string, unknown>>
}

function AdminPage() {
  const [email, setEmail] = useState('admin@awo-driving-school.local')
  const [password, setPassword] = useState('change-me-in-local-dev')
  const [token, setToken] = useState(() => localStorage.getItem('awo-admin-token') || '')
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadDashboard = async (authToken: string) => {
    const response = await fetch('/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Your session could not be verified.')
    }

    const data = (await response.json()) as DashboardData
    setDashboard(data)
  }

  useEffect(() => {
    if (!token) {
      return
    }

    loadDashboard(token).catch(() => {
      setToken('')
      localStorage.removeItem('awo-admin-token')
      setError('Your admin session expired. Please log in again.')
    })
  }, [token])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign in.')
      }

      const authToken = data.token as string
      setToken(authToken)
      localStorage.setItem('awo-admin-token', authToken)
      await loadDashboard(authToken)
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
                <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
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

  return (
    <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">AWO overview</h1>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
            Log out
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {dashboard ? (
            <>
              <StatCard label="Bookings" value={dashboard.totals.bookings} />
              <StatCard label="New enquiries" value={dashboard.totals.enquiries} />
              <StatCard label="Published services" value={dashboard.totals.services} />
              <StatCard label="Published pages" value={dashboard.totals.pages} />
            </>
          ) : (
            <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500">
              Loading dashboard...
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <AdminPanel title="Recent bookings" items={dashboard?.recentBookings ?? []} />
          <AdminPanel title="Recent enquiries" items={dashboard?.recentEnquiries ?? []} />
        </div>
      </div>
    </section>
  )
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
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No records available yet.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {Object.entries(item).slice(0, 4).map(([key, value]) => (
                <p key={key} className="mb-1">
                  <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}
                </p>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminPage
