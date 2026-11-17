import { ArrowRight, Check, ChevronDown, Compass } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal'
import { getPagePhotoSet, resolvePhoto } from '../data/photography'
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
  const fallbackPhotos = getPagePhotoSet(slug)
  const heroPhoto = resolvePhoto(page?.heroImageUrl ?? page?.bannerImageUrl, fallbackPhotos.hero, page?.heroImageAlt ?? page?.bannerImageAlt)
  const photos = {
    hero: heroPhoto,
    sections: fallbackPhotos.sections,
    cta: resolvePhoto(page?.bannerImageUrl, fallbackPhotos.cta, page?.bannerImageAlt),
  }
  const extrasLoading = ['driving-lessons', 'faqs', 'areas-we-cover', 'pay-as-you-go', 'intensive-courses', 'fast-track-courses'].includes(slug)
    && extras?.slug !== slug
  const isLegalPage = ['privacy-policy', 'cookie-policy', 'terms-and-conditions'].includes(slug)
  const heroHighlights: Record<string, string[]> = {
    about: ['Patient teaching', 'Clear guidance', 'Confidence-first coaching'],
    'driving-lessons': ['Beginner-friendly', 'Flexible timing', 'Real-world practice'],
    'beginner-driving-lessons': ['Calm starts', 'Progressive learning', 'Road-ready confidence'],
    'pay-as-you-go': ['Flexible lesson rhythm', 'No pressure', 'Built around your schedule'],
    'intensive-courses': ['Structured learning', 'Fast momentum', 'Focused support'],
    'fast-track-courses': ['Accelerated progress', 'Practical route planning', 'Test-ready habits'],
    'refresher-lessons': ['Confidence rebuild', 'Skill refresh', 'Road awareness'],
    'test-preparation': ['Mock practice', 'Test focus', 'Real scenario review'],
    'areas-we-cover': ['Local routes', 'Area-specific guidance', 'Practical coaching'],
    faqs: ['Helpful answers', 'Clear guidance', 'Confidence-building support'],
    contact: ['Friendly advice', 'Simple booking', 'Fast response'],
    booking: ['Easy enquiry', 'Clear next steps', 'Supportive guidance'],
  }
  const highlightList = heroHighlights[slug] ?? ['Supportive teaching', 'Practical learning', 'Confidence-first guidance']
  const [faqFilter, setFaqFilter] = useState('All')

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

  const renderSpecialisedPage = () => {
    if (slug === 'about') {
      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> AWO Driving School
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{page.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{page.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Patient teaching', 'Clear guidance', 'Confidence-first coaching'].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{item}</span>
                  ))}
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/book" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600">
                    Talk to AWO <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:text-emerald-900">
                    Explore courses
                  </Link>
                </div>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Our teaching philosophy</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">Calm coaching creates confident drivers.</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600">At AWO, teaching is shaped around confidence, clarity and practical decision-making. We help learners understand not just how to drive, but how to drive safely and comfortably in everyday situations.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {['Safe habits', 'Clear feedback', 'Progressive learning'].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">{item}</div>
                    ))}
                  </div>
                </Reveal>
                <Reveal className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)]">
                  <img src={photos.sections[0].src} alt={photos.sections[0].alt} width={1440} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </Reveal>
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Why learners choose AWO</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Supportive, practical, and focused on long-term confidence.</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { title: 'Build from where you are', body: 'Lessons can start gently and grow at a pace that feels manageable for you.' },
                  { title: 'Real-world road practice', body: 'Practical lessons focus on the situations that matter in everyday driving.' },
                  { title: 'Clear next steps', body: 'Instruction is intended to help you understand what to improve, and why.' },
                ].map(({ title, body }) => (
                  <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Check className="h-5 w-5" /></div>
                    <h3 className="text-xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-950 py-16 text-white sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              <div className="overflow-hidden rounded-[2rem] ring-1 ring-white/10">
                <img src={photos.sections[1].src} alt={photos.sections[1].alt} width={1440} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Meet your instructor</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">A patient coach who helps you learn with calm confidence.</h2>
                <p className="mt-4 text-base leading-7 text-slate-200">AWO coaching is built around helping learners feel more settled, better informed and more prepared for the road ahead. Instruction is practical, encouraging, and designed to make progress feel achievable.</p>
                <div className="mt-6 space-y-4">
                  {['Friendly and encouraging teaching', 'Practical, road-focused coaching', 'A calm, confidence-led learning style'].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'driving-lessons' || slug === 'courses') {
      const courseCards = extras?.services.length ? extras.services : [
        { id: 1, title: 'Beginner lessons', description: 'A gradual and supportive introduction to the road and controls.' },
        { id: 2, title: 'Pay As You Go', description: 'Flexible booking structure for learners wanting more freedom.' },
        { id: 3, title: 'Fast-Track courses', description: 'Focused progression for learners ready to build momentum.' },
      ]

      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> Course options
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Choose the right rhythm for your learning.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">AWO lesson options are designed to balance confidence, control and real-world road experience. Choose the format that fits your current stage and goals.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {['Beginner-friendly', 'Flexible scheduling', 'Confidence-first'].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{item}</span>
                  ))}
                </div>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Course categories</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Find the structure that matches your stage.</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {courseCards.map(({ title, description }, index) => (
                  <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold">0{index + 1}</div>
                    <h3 className="text-xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                    <Link to="/book" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">Ask about this option <ArrowRight className="h-4 w-4" /></Link>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Course comparison</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">A simple way to compare lesson formats.</h2>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-950 text-white">
                      <tr>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Course</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Best for</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Learning style</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Main focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { course: 'Beginner lessons', best: 'New drivers', style: 'Steady and supportive', focus: 'Controls, basics and confidence' },
                        { course: 'Pay As You Go', best: 'Flexible learners', style: 'Self-paced', focus: 'Routine progress and comfort' },
                        { course: 'Fast Track', best: 'Motivated learners', style: 'Focused and regular', focus: 'Momentum and test readiness' },
                        { course: 'Refresher', best: 'Returning drivers', style: 'Calm and practical', focus: 'Confidence and road awareness' },
                      ].map(({ course, best, style, focus }) => (
                        <tr key={course} className="border-t border-slate-200 text-sm text-slate-700">
                          <td className="px-5 py-4 font-bold text-slate-900">{course}</td>
                          <td className="px-5 py-4">{best}</td>
                          <td className="px-5 py-4">{style}</td>
                          <td className="px-5 py-4">{focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'pay-as-you-go') {
      const pricingOptions = extras?.pricing.length ? extras.pricing : [
        { id: 1, name: 'Standard lesson', description: 'Flexible booking for ongoing progress', price: 'Lesson rate available on enquiry' },
        { id: 2, name: 'Regular practice plan', description: 'A steady rhythm for learners who prefer consistency', price: 'Discuss with AWO' },
      ]

      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> Flexible lessons
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Pay as you go, with a pace that works for you.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">This option is ideal when you want more freedom to book as you go and build confidence without committing to a fixed package.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {['Flexible timing', 'No pressure', 'Build at your pace'].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{item}</span>
                  ))}
                </div>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-5 md:grid-cols-2">
                {pricingOptions.map(({ name, description, price }) => (
                  <article key={name} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Lesson option</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-950">{name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Available</p>
                      <p className="mt-2 text-lg font-black text-slate-950">{price || 'Ask for current lesson details'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">How it works</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">A simple lesson plan built around your confidence.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Choose a lesson rhythm', body: 'Book when it suits your availability and comfort level.' },
                  { title: 'Focus on what matters', body: 'Choose the skills and situations you want to build confidence in.' },
                  { title: 'Review your progress', body: 'Use each lesson to decide what the next step should be.' },
                ].map(({ title, body }, index) => (
                  <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">0{index + 1}</span>
                    <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'fast-track-courses' || slug === 'intensive-courses') {
      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> Intensive learning
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Focused learning for learners who want momentum.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Fast-track options are designed to keep progress moving with regular practice, clear goals and a more structured route through key driving skills.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {['Regular practice', 'Clear momentum', 'Focused support'].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{item}</span>
                  ))}
                </div>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Learning journey</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">A focused route from foundation to road confidence.</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { title: 'Assess your starting point', body: 'Discuss your current experience and what you want to improve.' },
                  { title: 'Build key driving skills', body: 'Focus on the areas that matter most for confidence, safety and control.' },
                  { title: 'Keep momentum in the final stages', body: 'Use regular feedback to sharpen comfort and decision-making.' },
                ].map(({ title, body }, index) => (
                  <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">0{index + 1}</span>
                    <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'faqs') {
      const categories = ['All', 'Beginner lessons', 'Driving courses', 'Pay As You Go', 'Fast Track', 'Booking', 'Road tests']
      const filteredFaqs = extras?.faqs.length ? extras.faqs.filter((faq) => {
        if (faqFilter === 'All') return true
        const text = `${faq.question} ${faq.answer}`.toLowerCase()
        if (faqFilter === 'Beginner lessons') return /beginner|nervous|new driver|first lesson/.test(text)
        if (faqFilter === 'Driving courses') return /course|lesson|refresher|test prep|driving/.test(text)
        if (faqFilter === 'Pay As You Go') return /pay as you go|flexible|book/.test(text)
        if (faqFilter === 'Fast Track') return /fast track|intensive|regular|momentum/.test(text)
        if (faqFilter === 'Booking') return /availability|book|booking|contact|enquire|arrange/.test(text)
        if (faqFilter === 'Road tests') return /test|practical|driving test/.test(text)
        return true
      }) : [
        { id: 1, question: 'Do you teach nervous beginners?', answer: 'Yes. Lessons can begin with the basics and build confidence gradually.' },
        { id: 2, question: 'Can I ask about availability and lesson types?', answer: 'Yes. AWO can discuss lesson formats and current availability directly.' },
      ]

      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> Good to know
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Helpful answers before your next lesson.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">A few of the most common questions from learners, nervous drivers and people planning their next step with AWO.</p>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFaqFilter(category)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${faqFilter === category ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-100' : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-900'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-slate-200 rounded-[2rem] border border-slate-200 bg-white">
                {filteredFaqs.map(({ id, question, answer }) => (
                  <details key={id} className="group px-5 py-5 sm:px-7" open={id === filteredFaqs[0]?.id}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                      {question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'areas-we-cover') {
      const areas = extras?.areas.length ? extras.areas : [
        { id: 1, name: 'Local learner routes', description: 'High-confidence practice in roads and junctions that matter to everyday driving.' },
        { id: 2, name: 'Busy roads and roundabouts', description: 'Build confidence in busier settings and more demanding junction choices.' },
        { id: 3, name: 'Residential driving', description: 'Comfortable practice in quieter streets and residential areas.' },
      ]

      return (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> Local confidence
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Driving confidence that works in your local roads.</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">AWO can help learners practise the roads, junctions and scenarios that matter most in the areas they drive through every day.</p>
              </Reveal>
              <figure className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
              </figure>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-5 md:grid-cols-3">
                {areas.map(({ name, description }, index) => (
                  <article key={name} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold">0{index + 1}</div>
                    <h2 className="text-xl font-bold text-slate-950">{name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )
    }

    return null
  }

  return (
    <>
      <Helmet>
        <title>{page.seoTitle}</title>
        <meta name="description" content={page.metaDescription} />
      </Helmet>
      {renderSpecialisedPage() || (
        <>
          <section className="bg-white py-10 sm:py-14">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8">
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                  <Compass className="h-4 w-4" /> AWO Driving School
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{page.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{page.description}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlightList.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
                {!isLegalPage ? (
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link to="/book" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-600">
                      Talk to AWO <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:text-emerald-900">
                      Explore courses
                    </Link>
                  </div>
                ) : null}
              </Reveal>
              <figure className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                <img src={photos.hero.src} alt={photos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
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
                    const fallback = photos.sections[index % photos.sections.length]
                    const photo = resolvePhoto(section.imageUrl, fallback, section.imageAlt)
                    const imageFirst = index % 2 === 0
                    return (
                      <article key={section.heading} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                        <Reveal className={imageFirst ? 'order-1' : 'order-2 lg:order-2'}>
                          <figure className="relative overflow-hidden rounded-[1.75rem] shadow-lg shadow-slate-900/10 ring-1 ring-slate-200">
                            <img src={photo.src} alt={photo.alt} width={1440} height={1000} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback.src }} />
                          </figure>
                        </Reveal>
                        <Reveal className={imageFirst ? 'order-2' : 'order-1 lg:order-1'}>
                          <div className="max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] sm:p-8">
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
            </div>
          </section>

          {!isLegalPage ? (
            <section className="relative isolate overflow-hidden bg-slate-950 py-14 text-white sm:py-16">
              <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Your next step</p>
                  <h2 className="mt-2 text-3xl font-black">Book a lesson and start with confidence.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500">
                    Book a lesson <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/courses" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                    See course options
                  </Link>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  )
}

export default GenericPage
