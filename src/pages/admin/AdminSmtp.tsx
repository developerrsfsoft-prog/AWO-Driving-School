import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function AdminSmtp() {
  const { token } = useOutletContext<{ token: string }>()
  const [password, setPassword] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState(587)
  const [secure, setSecure] = useState(false)
  const [username, setUsername] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('AWO Driving School')
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/smtp', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setHost(data.host || '')
        setPort(data.port || 587)
        setSecure(!!data.secure)
        setUsername(data.username || '')
        setFromEmail(data.from_email || '')
        setFromName(data.from_name || 'AWO Driving School')
        setEnabled(!!data.enabled)
      })
      .catch(() => setError('Failed to load SMTP settings.'))
  }, [token])

  const save = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ host, port, secure, username, password, from_email: fromEmail, from_name: fromName, enabled }),
      })
      if (!res.ok) throw new Error('Failed to save.')
      setMessage('SMTP settings saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const testEmail = async () => {
    setTesting(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Test failed.')
      setMessage('Test email sent successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">SMTP Configuration</h1>
        <p className="mt-1 text-sm text-slate-600">Configure email delivery for booking confirmations and notifications.</p>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">SMTP Host</label>
            <input value={host} onChange={(e) => setHost(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Port</label>
            <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="Leave blank to keep existing" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">From Email</label>
            <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">From Name</label>
            <input value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Use TLS/SSL (secure)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            Enabled
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={saving} className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          <button onClick={testEmail} disabled={testing} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {testing ? 'Testing...' : 'Send test email'}
          </button>
        </div>
      </div>
    </div>
  )
}