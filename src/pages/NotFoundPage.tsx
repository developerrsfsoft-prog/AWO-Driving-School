import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="bg-slate-50 py-24 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">404 · Page not found</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">This road ends here.</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          The page may have moved or the address may be incorrect.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
