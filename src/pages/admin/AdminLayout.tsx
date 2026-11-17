import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Images, Mail, CalendarCheck, LogOut } from 'lucide-react'
import Logo from '../../components/layout/Logo'

export default function AdminLayout() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('awo-admin-token') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to sign in.')
      localStorage.setItem('awo-admin-token', data.token)
      setToken(data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('awo-admin-token')
    setToken('')
  }

  if (!token) {
    return (
      <section className="min-h-screen bg-slate-100 py-20 text-slate-900">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin access</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Sign in</h1>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400" required />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-400" required />
              </div>
              {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={loading} className="w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500"><Link to="/" className="hover:text-slate-800">Back to website</Link></p>
          </div>
        </div>
      </section>
    )
  }

  const nav = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/gallery', label: 'Gallery', icon: Images },
    { to: '/admin/enquiries', label: 'Enquiries', icon: Mail },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-900">
      {/* Mobile top bar with horizontal nav */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">AWO Admin</p>
                <p className="text-sm font-bold text-slate-900">Dashboard</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link to="/" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">Website</Link>
              <button type="button" onClick={logout} className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${isActive ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-12 pb-8 sm:px-6 lg:flex-row lg:items-start lg:px-8 lg:pt-20">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 border-b border-slate-100 pb-4">
              <Logo className="h-8 w-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">AWO Admin</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Dashboard</p>
              </div>
            </div>
            <nav className="space-y-1">
              {nav.map(({ to, end, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link to="/" className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">View website</Link>
              <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <Outlet context={{ token, onExpired: logout }} />
        </main>
      </div>
    </div>
  )
}
