import { useEffect, useState } from 'react'
import {
  defaultHomepageSections,
  homepageSectionOptions,
  parseHomepagePresentation,
  type HomepageCounter,
  type HomepageSections,
} from '../data/homepagePresentation'

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

type AdminRecord = Record<string, unknown>
type HomepageCounterDraft = Omit<HomepageCounter, 'value'> & { value: string }

const adminSections = [
  { value: 'pages', label: 'Pages', identity: 'slug' },
  { value: 'services', label: 'Services', identity: 'id' },
  { value: 'faqs', label: 'FAQs', identity: 'id' },
  { value: 'testimonials', label: 'Testimonials', identity: 'id' },
  { value: 'areas', label: 'Areas', identity: 'id' },
  { value: 'pricing', label: 'Pricing', identity: 'id' },
  { value: 'bookings', label: 'Bookings', identity: 'id' },
  { value: 'enquiries', label: 'Enquiries', identity: 'id' },
  { value: 'settings', label: 'Settings', identity: 'key' },
] as const

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
  const [editor, setEditor] = useState('{}')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [recordMessage, setRecordMessage] = useState('')
  const [recordError, setRecordError] = useState('')
  const [recordsForQuery, setRecordsForQuery] = useState('')
  const [homepageSections, setHomepageSections] = useState<HomepageSections>(defaultHomepageSections)
  const [homepageCounters, setHomepageCounters] = useState<HomepageCounterDraft[]>([])
  const [presentationLoading, setPresentationLoading] = useState(true)
  const [presentationSaving, setPresentationSaving] = useState(false)
  const [presentationError, setPresentationError] = useState('')
  const [presentationMessage, setPresentationMessage] = useState('')
  const queryKey = `${activeResource}:${search}`
  const recordsLoading = recordsForQuery !== queryKey

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

  const handleExpiredSession = () => {
    setToken('')
    localStorage.removeItem('awo-admin-token')
    setError('Your admin session expired. Please log in again.')
  }

  useEffect(() => {
    if (!token) {
      return
    }

    // The state update follows an auth request and this effect only tracks the token.
    // oxlint-disable-next-line react/set-state-in-effect
    loadDashboard(token).catch(handleExpiredSession)
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Homepage presentation settings could not be loaded.')
        }
        return data as AdminRecord[]
      })
      .then((settings) => {
        if (!active) {
          return
        }
        const saved = settings.find((setting) => setting.key === 'homepage_presentation')
        const presentation = parseHomepagePresentation(typeof saved?.value === 'string' ? saved.value : undefined)
        setHomepageSections(presentation.sections)
        setHomepageCounters(presentation.counters.map((counter) => ({ ...counter, value: String(counter.value) })))
        setPresentationError('')
      })
      .catch((loadError) => {
        if (active) {
          setPresentationError(loadError instanceof Error ? loadError.message : 'Homepage presentation settings could not be loaded.')
        }
      })
      .finally(() => {
        if (active) {
          setPresentationLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    fetch(`/api/admin/${activeResource}?q=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Unable to load records.')
        }
        return data as AdminRecord[]
      })
      .then((data) => {
        if (active) {
          setRecords(data)
          setSelectedId('')
          setEditor('{}')
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

    return () => {
      active = false
    }
  }, [token, activeResource, search, refreshKey, queryKey])

  const selectedRecord = records.find(
    (record) => String(record[getResourceIdentity(activeResource)] ?? '') === selectedId,
  )

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

  const handleSaveRecord = async (event: React.FormEvent) => {
    event.preventDefault()
    setRecordError('')
    setRecordMessage('')
    try {
      const payload = JSON.parse(editor) as AdminRecord
      const previousPublication = selectedRecord ? getPublicationState(selectedRecord) : null
      const nextPublication = getPublicationState(payload)
      if (nextPublication !== null && nextPublication !== previousPublication) {
        const action = nextPublication ? 'publish' : 'unpublish'
        if (!window.confirm(`Are you sure you want to ${action} this record?`)) {
          return
        }
      }
      const identity = getResourceIdentity(activeResource)
      const editingId = selectedRecord ? String(selectedRecord[identity]) : ''
      const endpoint = editingId
        ? `/api/admin/${activeResource}/${encodeURIComponent(editingId)}`
        : `/api/admin/${activeResource}`
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Unable to save record.')
      }
      setRecordMessage('Record saved successfully.')
      setRefreshKey((key) => key + 1)
    } catch (saveError) {
      setRecordError(saveError instanceof Error ? saveError.message : 'Enter a valid JSON record.')
    }
  }

  const handleDeleteRecord = async () => {
    if (!selectedRecord || !window.confirm('Delete this record permanently?')) {
      return
    }
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
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Unable to delete record.')
      }
      setSelectedId('')
      setEditor('{}')
      setRecordMessage('Record deleted successfully.')
      setRefreshKey((key) => key + 1)
    } catch (deleteError) {
      setRecordError(deleteError instanceof Error ? deleteError.message : 'Unable to delete record.')
    }
  }

  const handleNewRecord = () => {
    if (selectedRecord && !window.confirm('Discard unsaved edits and create a new record?')) {
      return
    }
    setSelectedId('')
    setEditor(getNewRecordTemplate(activeResource))
    setRecordMessage('')
    setRecordError('')
  }

  const handleSavePresentation = async (event: React.FormEvent) => {
    event.preventDefault()
    setPresentationError('')
    setPresentationMessage('')

    const counters: HomepageCounter[] = []
    for (const [index, counter] of homepageCounters.entries()) {
      const value = Number(counter.value)
      if (!counter.label.trim() || counter.value.trim() === '' || !Number.isFinite(value) || value < 0) {
        setPresentationError(`Counter ${index + 1} needs a label and a non-negative numeric value.`)
        return
      }
      counters.push({
        ...counter,
        label: counter.label.trim(),
        value,
      })
    }

    setPresentationSaving(true)
    try {
      const settingsResponse = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const settings = await settingsResponse.json()
      if (!settingsResponse.ok) {
        throw new Error(typeof settings.error === 'string' ? settings.error : 'Could not load current settings.')
      }
      const current = (settings as AdminRecord[]).find((setting) => setting.key === 'homepage_presentation')
      const response = await fetch(
        current ? '/api/admin/settings/homepage_presentation' : '/api/admin/settings',
        {
          method: current ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'homepage_presentation',
            value: JSON.stringify({ sections: homepageSections, counters }),
          }),
        },
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Homepage presentation settings could not be saved.')
      }
      setHomepageCounters(counters.map((counter) => ({ ...counter, value: String(counter.value) })))
      setPresentationMessage('Homepage presentation saved.')
      setRefreshKey((key) => key + 1)
    } catch (saveError) {
      setPresentationError(saveError instanceof Error ? saveError.message : 'Homepage presentation settings could not be saved.')
    } finally {
      setPresentationSaving(false)
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
                <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
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

        <form onSubmit={handleSavePresentation} className="mt-10 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Homepage presentation</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Manage visible sections and counters</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Only add figures verified by your business. Counter values are stored in the existing site settings.
              </p>
            </div>
            <button type="submit" disabled={presentationLoading || presentationSaving} className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {presentationSaving ? 'Saving...' : 'Save homepage settings'}
            </button>
          </div>

          {presentationLoading ? <p className="mt-5 text-sm text-slate-500">Loading homepage settings...</p> : null}
          <div className="mt-7 grid gap-8 lg:grid-cols-2">
            <fieldset disabled={presentationLoading || presentationSaving}>
              <legend className="text-sm font-bold text-slate-900">Visible homepage sections</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {homepageSectionOptions.map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-300">
                    <input
                      type="checkbox"
                      checked={homepageSections[key]}
                      onChange={(event) => setHomepageSections((current) => ({ ...current, [key]: event.target.checked }))}
                      className="h-4 w-4 accent-amber-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">Verified counters</h3>
                <button
                  type="button"
                  disabled={presentationLoading || presentationSaving || homepageCounters.length >= 8}
                  onClick={() => setHomepageCounters((current) => [...current, { value: '', label: '', prefix: '', suffix: '' }])}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-400 disabled:opacity-50"
                >
                  Add counter
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Leave this list empty until you have genuine, approved figures. Up to 8 counters.</p>
              <div className="mt-3 space-y-3">
                {homepageCounters.map((counter, index) => (
                  <div key={`${index}-${counter.label}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1.4fr_0.7fr_0.7fr_auto]">
                    <label className="text-xs font-semibold text-slate-600">
                      Value
                      <input type="number" min="0" step="1" value={counter.value} onChange={(event) => setHomepageCounters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Label
                      <input value={counter.label} onChange={(event) => setHomepageCounters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="e.g. Active learners" />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Prefix
                      <input value={counter.prefix} onChange={(event) => setHomepageCounters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, prefix: event.target.value } : item))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="£" />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Suffix
                      <input value={counter.suffix} onChange={(event) => setHomepageCounters((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, suffix: event.target.value } : item))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="+" />
                    </label>
                    <button type="button" aria-label={`Remove counter ${index + 1}`} onClick={() => setHomepageCounters((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="self-end rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                ))}
                {homepageCounters.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No homepage counters are published.</p> : null}
              </div>
            </div>
          </div>
          {presentationError ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{presentationError}</p> : null}
          {presentationMessage ? <p aria-live="polite" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{presentationMessage}</p> : null}
        </form>

        <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Content and records</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Manage site data</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-[34rem]">
              <div>
                <label htmlFor="admin-resource" className="mb-2 block text-sm font-medium text-slate-700">Record type</label>
                <select
                  id="admin-resource"
                  value={activeResource}
                  onChange={(event) => {
                    setActiveResource(event.target.value as typeof activeResource)
                    setSelectedId('')
                    setEditor('{}')
                    setRecordMessage('')
                    setRecordError('')
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                >
                  {adminSections.map((section) => <option key={section.value} value={section.value}>{section.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="admin-search" className="mb-2 block text-sm font-medium text-slate-700">Search records</label>
                <input
                  id="admin-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                  placeholder="Filter by text"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">Records</h3>
                <button type="button" onClick={handleNewRecord} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">
                  New
                </button>
              </div>
              <div className="mt-4 max-h-[32rem] space-y-2 overflow-auto">
                {recordsLoading ? <p className="text-sm text-slate-500">Loading records...</p> : null}
                {!recordsLoading && records.length === 0 ? <p className="text-sm text-slate-500">No records found.</p> : null}
                {records.map((record, index) => {
                  const identity = getResourceIdentity(activeResource)
                  const id = String(record[identity] ?? '')
                  const label = String(record.title ?? record.question ?? record.name ?? record.customer_name ?? record.full_name ?? record.key ?? record.slug ?? id)
                  return (
                    <button
                      type="button"
                      key={id || index}
                      onClick={() => {
                        setSelectedId(id)
                        setEditor(JSON.stringify(record, null, 2))
                        setRecordMessage('')
                        setRecordError('')
                      }}
                      className={`block w-full rounded-xl border p-3 text-left text-sm transition ${id === selectedId ? 'border-amber-400 bg-amber-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                    >
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
                {selectedRecord ? (
                  <button type="button" onClick={handleDeleteRecord} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    Delete
                  </button>
                ) : null}
              </div>
              <label htmlFor="admin-record-json" className="sr-only">Record JSON</label>
              <textarea
                id="admin-record-json"
                value={editor}
                onChange={(event) => setEditor(event.target.value)}
                rows={20}
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none focus:border-amber-400"
              />
              {recordError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{recordError}</p> : null}
              {recordMessage ? <p aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{recordMessage}</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">
                  Save record
                </button>
                <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">
                  Refresh
                </button>
                <p className="text-xs text-slate-500">Records use JSON fields. Invalid data is rejected by the server.</p>
              </div>
            </form>
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
    pages: { slug: '', title: '', description: '', seoTitle: '', metaDescription: '', status: 'draft', sections: [] },
    services: { slug: '', title: '', summary: '', description: '', status: 'draft' },
    faqs: { question: '', answer: '', published: false },
    testimonials: { customer_name: '', quote: '', verified: false },
    areas: { name: '', description: '', published: false },
    pricing: { name: '', description: '', price: '', status: 'draft' },
    bookings: { full_name: '', phone: '', email: '', driving_experience: '', lesson_type: '', preferred_date: '', preferred_time: '', contact_preference: 'Email', message: '', status: 'new' },
    enquiries: { name: '', email: '', phone: '', message: '', status: 'new' },
    settings: { key: '', value: '' },
  }
  return JSON.stringify(templates[resource], null, 2)
}

function getPublicationState(record: AdminRecord): boolean | null {
  if (typeof record.status === 'string') {
    return record.status === 'published'
  }
  if (typeof record.published === 'boolean') {
    return record.published
  }
  if (typeof record.verified === 'boolean') {
    return record.verified
  }
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
