import { ArrowRight, Check, ChevronDown, Compass, MapPin, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal'
import SectionHeading from '../components/common/SectionHeading'
import { getPagePhotoSet } from '../data/photography'
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
  const photos = getPagePhotoSet(slug)
  const extrasLoading = ['driving-lessons', 'faqs', 'areas-we-cover', 'pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug)
    && extras?.slug !== slug
  const isLegalPage = ['privacy-policy', 'cookie-policy', 'terms-and-conditions'].includes(slug)

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
          setExtras({ slug, ...data, error: '' })
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
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-10">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="mt-6 h-12 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-200" />
        </div>
      </section>
    )
  }

  if (!page) {
    return (
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div role="alert" className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
          {error || 'This page could not be loaded. Please try again in a moment.'}
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

      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
              <Compass className="h-4 w-4" /> AWO Driving School
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{page.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{page.description}</p>
            {!isLegalPage ? (
              <Link to="/book" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600">
                Talk to AWO <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </Reveal>
          <figure className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10">
            <img
              src={photos.hero.src}
              alt={photos.hero.alt}
              width={1440}
              height={1000}
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
              Illustrative stock photography
            </figcaption>
          </figure>
        </div>
        {error ? (
          <p role="status" className="mx-auto mt-8 max-w-7xl px-4 text-sm text-amber-800 sm:px-6 lg:px-8">{error}</p>
        ) : null}
      </section>

      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {page.sections.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">There is no published content on this page yet.</p>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {page.sections.map((section, index) => {
                const photo = photos.sections[index % photos.sections.length]
                const imageFirst = index % 2 === 0
                return (
                  <article key={section.heading} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                    <Reveal className={imageFirst ? 'order-1' : 'order-2 lg:order-2'}>
                      <figure className="relative overflow-hidden rounded-[1.5rem] shadow-lg shadow-slate-900/10">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          width={1440}
                          height={1000}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                          Illustrative stock photography
                        </figcaption>
                      </figure>
                    </Reveal>
                    <Reveal className={imageFirst ? 'order-2' : 'order-1 lg:order-1'}>
                      <div className="max-w-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">0{index + 1} / AWO guide</p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{section.heading}</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">{section.body}</p>
                        {section.items.length > 0 ? (
                          <ul className="mt-5 space-y-3">
                            {section.items.map((item) => (
                              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </Reveal>
                  </article>
                )
              })}
            </div>
          )}

          {extrasLoading ? <p className="mt-10 text-sm text-slate-500">Loading related content...</p> : null}
          {extras?.slug === slug && extras.error ? (
            <p role="status" className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{extras.error}</p>
          ) : null}
          {extras?.slug === slug && slug === 'driving-lessons' ? (
            <RelatedList
              title="Published lesson options"
              items={extras.services.map(({ id, title, description }) => ({ id, title, description }))}
              emptyMessage="No published lessons are available yet."
              photos={photos.sections}
            />
          ) : null}
          {extras?.slug === slug && slug === 'faqs' ? (
            <div className="mt-16 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <SectionHeading eyebrow="Good to know" title="Frequently asked questions" description="Helpful details about learning with AWO." />
                <img
                  src={photos.sections[0].src}
                  alt={photos.sections[0].alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="mt-6 aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                />
              </div>
              <div className="divide-y divide-slate-200 rounded-[1.5rem] border border-slate-200 bg-white px-5 sm:px-7">
                {extras.faqs.map(({ id, question, answer }, index) => (
                  <details key={id} open={index === 0} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                      {question}<ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
                  </details>
                ))}
                {extras.faqs.length === 0 ? <p className="py-5 text-sm text-slate-500">There are no published answers yet.</p> : null}
              </div>
            </div>
          ) : null}
          {extras?.slug === slug && slug === 'areas-we-cover' ? (
            <RelatedList
              title="Published service areas"
              items={extras.areas.map(({ id, name, description }) => ({ id, title: name, description }))}
              emptyMessage="No service areas have been published yet."
              photos={photos.sections}
            />
          ) : null}
          {extras?.slug === slug && ['pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug) ? (
            <RelatedList
              title="Published pricing options"
              items={extras.pricing.map(({ id, name, description, price }) => ({ id, title: name, description: `${description}${price ? ` · ${price}` : ''}` }))}
              emptyMessage="No pricing options have been published yet."
              photos={photos.sections}
            />
          ) : null}
        </div>
      </section>

      {!isLegalPage ? (
        <section className="relative isolate overflow-hidden bg-slate-950 py-14 text-white sm:py-16">
          <img
            src={photos.cta.src}
            alt={photos.cta.alt}
            width={1440}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-slate-950/75" />
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Take the next step</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">A question is a good place to start.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Talk through your goals, experience and lesson options.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                Contact us <MapPin className="h-4 w-4" />
              </Link>
              <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
                Enquire about lessons <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function RelatedList({ title, items, emptyMessage, photos }: {
  title: string
  items: Array<{ id: number; title: string; description: string }>
  emptyMessage: string
  photos: ReturnType<typeof getPagePhotoSet>['sections']
}) {
  return (
    <section className="mt-16">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-emerald-50 p-2 text-emerald-800"><ShieldCheck className="h-5 w-5" /></span>
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      </div>
      {items.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {items.map((item, index) => {
            const photo = photos[index % photos.length]
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      ) : <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{emptyMessage}</p>}
    </section>
  )
}

export default GenericPage
