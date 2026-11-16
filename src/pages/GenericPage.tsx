import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { PageContent } from '../data/fallbackPages'
import { getPageBySlug } from '../services/api'

function GenericPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getPageBySlug(slug)
      .then((data) => {
        if (active) {
          setPage(data)
        }
      })
      .catch(() => {
        if (active) {
          setPage(null)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[2rem] border border-slate-200 bg-white p-10">
            <div className="h-4 w-32 rounded-full bg-slate-200" />
            <div className="mt-6 h-12 w-3/4 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    )
  }

  if (!page) {
    return (
      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
            This page could not be loaded. Please try again in a moment.
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>{page.seoTitle}</title>
        <meta name="description" content={page.metaDescription} />
      </Helmet>

      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">AWO Driving School</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.description}</p>

            <div className="mt-10 space-y-8">
              {page.sections.map((section) => (
                <article key={section.heading} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-2xl font-bold text-slate-900">{section.heading}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{section.body}</p>

                  {section.items.length > 0 ? (
                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default GenericPage
