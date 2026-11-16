import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePublicPage } from '../hooks/usePublicPage'
import {
  getPublicAreas,
  getPublicFaqs,
  getPublicPricing,
  getPublicServices,
  type PublicArea,
  type PublicFaq,
  type PublicPricingPlan,
  type PublicService,
} from '../services/api'

type PageExtras = {
  slug: string
  services: PublicService[]
  faqs: PublicFaq[]
  areas: PublicArea[]
  pricing: PublicPricingPlan[]
  error: string
}

function GenericPage({ slug }: { slug: string }) {
  const { page, loading, error } = usePublicPage(slug)
  const [extras, setExtras] = useState<PageExtras | null>(null)
  const extrasLoading = ['driving-lessons', 'faqs', 'areas-we-cover', 'pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug)
    && extras?.slug !== slug

  useEffect(() => {
    let active = true
    const request: Promise<Omit<PageExtras, 'slug' | 'error'>> | null = slug === 'driving-lessons'
      ? getPublicServices().then((services) => ({ services, faqs: [], areas: [], pricing: [] }))
      : slug === 'faqs'
        ? getPublicFaqs().then((faqs) => ({ services: [], faqs, areas: [], pricing: [] }))
        : slug === 'areas-we-cover'
          ? getPublicAreas().then((areas) => ({ services: [], faqs: [], areas, pricing: [] }))
          : ['pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug)
            ? getPublicPricing().then((pricing) => ({ services: [], faqs: [], areas: [], pricing }))
            : null

    if (!request) {
      return
    }

    request
      .then((data) => {
        if (active) {
          setExtras({
            slug,
            ...data,
            error: '',
          })
        }
      })
      .catch(() => {
        if (active) {
          setExtras({ slug, services: [], faqs: [], areas: [], pricing: [], error: 'Related content could not be loaded.' })
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
            {error || 'This page could not be loaded. Please try again in a moment.'}
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
              {page.sections.length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                  There is no published content on this page yet.
                </p>
              ) : null}
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

            {extrasLoading ? <p className="mt-8 text-sm text-slate-500">Loading related content...</p> : null}
            {extras?.slug === slug && extras.error ? (
              <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{extras.error}</p>
            ) : null}
            {extras?.slug === slug && slug === 'driving-lessons' ? (
              <RelatedList title="Published lessons" items={extras.services.map(({ id, title, description }) => ({ id, title, description }))} emptyMessage="No published lessons are available yet." />
            ) : null}
            {extras?.slug === slug && slug === 'faqs' ? (
              <div className="mt-8 space-y-3">
                {extras.faqs.map(({ id, question, answer }, index) => (
                  <details key={id} open={index === 0} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <summary className="cursor-pointer font-semibold text-slate-900">{question}</summary>
                    <p className="mt-3 leading-7 text-slate-600">{answer}</p>
                  </details>
                ))}
                {extras.faqs.length === 0 ? <p className="text-sm text-slate-500">There are no published answers yet.</p> : null}
              </div>
            ) : null}
            {extras?.slug === slug && slug === 'areas-we-cover' ? (
              <RelatedList title="Current service areas" items={extras.areas.map(({ id, name, description }) => ({ id, title: name, description }))} emptyMessage="No service areas have been published yet." />
            ) : null}
            {extras?.slug === slug && ['pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug) ? (
              <RelatedList
                title="Published pricing options"
                items={extras.pricing.map(({ id, name, description, price }) => ({ id, title: name, description: `${description}${price ? ` · ${price}` : ''}` }))}
                emptyMessage="No pricing options have been published yet."
              />
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}

function RelatedList({ title, items, emptyMessage }: {
  title: string
  items: Array<{ id: number; title: string; description: string }>
  emptyMessage: string
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      ) : <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>}
    </section>
  )
}

export default GenericPage
