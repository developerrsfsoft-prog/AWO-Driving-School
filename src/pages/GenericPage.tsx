import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import PageHero from '../components/common/PageHero'
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
  const isCoursePage = ['driving-lessons', 'beginner-driving-lessons', 'pay-as-you-go', 'intensive-courses', 'fast-track-courses', 'refresher-lessons', 'test-preparation'].includes(slug)
  const heroHighlights: Record<string, string[]> = {
    about: ['Patient teaching', 'Clear guidance', 'Confidence-first coaching'],
    'driving-lessons': ['All experience levels', 'Practical road skills', 'Calm, structured coaching'],
    'beginner-driving-lessons': ['Step-by-step start', 'Nervous-driver friendly', 'Build safe habits early'],
    'pay-as-you-go': ['Flexible scheduling', 'Learn at your pace', 'No fixed block required'],
    'intensive-courses': ['Regular practice', 'Structured progression', 'Build momentum safely'],
    'fast-track-courses': ['Goal-led lessons', 'Focused training plan', 'Efficient, steady progress'],
    'refresher-lessons': ['Rebuild confidence', 'Targeted practice', 'Support after a break'],
    'test-preparation': ['Test-ready skills', 'Mock-test practice', 'Calm, honest feedback'],
    'areas-we-cover': ['Local routes', 'Real road scenarios', 'Practical confidence'],
    faqs: ['Clear answers', 'Helpful guidance', 'Plan your next step'],
    contact: ['Friendly advice', 'Simple enquiry', 'Helpful next steps'],
    booking: ['Easy enquiry', 'Clear next steps', 'Supportive guidance'],
  }
  const highlightList = heroHighlights[slug] ?? ['Supportive teaching', 'Practical learning', 'Confidence-first guidance']
  const [faqFilter, setFaqFilter] = useState('All')
  const courseHeroForm = (
    <div className="relative mx-auto max-w-[480px] rounded-[1.8rem] border border-white/25 bg-white/10 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur lg:ml-auto lg:max-w-[520px]">
      <div className="rounded-[1.4rem] bg-white p-5 text-[#1c1915]">
        <h2 className="text-xl font-black tracking-tight text-[#10211c]">Enquiry form</h2>
        <p className="mt-1 text-sm text-[#5a5046]">Complete the form to send your lesson request to AWO.</p>
        <form className="mt-4 space-y-3">
          <input type="text" placeholder="Your name" className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          <input type="email" placeholder="you@example.com" className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          <input type="tel" placeholder="+44 7..." className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          <select className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]">
            <option value="">Lesson type</option>
            <option value="Beginner lessons">Beginner lessons</option>
            <option value="Pay As You Go">Pay As You Go</option>
            <option value="Fast-Track Courses">Fast-Track Courses</option>
            <option value="Refresher courses">Refresher courses</option>
            <option value="Test preparation">Test preparation</option>
          </select>
          <textarea rows={3} placeholder="Tell us about your current driving experience, anxieties, or targets." className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
            <input type="time" className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          </div>
          <select className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]">
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Text message">Text message</option>
          </select>
          <textarea rows={2} placeholder="Any details you’d like us to know before your first lesson?" className="w-full rounded-xl border border-[#e3d6c2] bg-[#f7f3eb] px-3 py-2.5 text-sm text-[#1c1915] outline-none focus:border-[#143028]" />
          <button type="submit" className="btn btn-primary w-full !min-h-10 !px-4">Request a lesson</button>
        </form>
      </div>
    </div>
  )

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
          <PageHero eyebrow="AWO Driving School" title={page.title} description={page.description} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src}>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Patient teaching', 'Clear guidance', 'Confidence-first coaching'].map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn btn-brass">Talk to AWO <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/courses" className="btn btn-ghost">Explore courses</Link>
            </div>
          </PageHero>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)] sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Our teaching philosophy</p>
                  <h2 className="mt-3 text-3xl display text-slate-950">Calm coaching creates confident drivers.</h2>
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
                <h2 className="mt-3 text-3xl display tracking-tight text-slate-950">Supportive, practical, and focused on long-term confidence.</h2>
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
                <h2 className="mt-3 text-3xl display tracking-tight">A patient coach who helps you learn with calm confidence.</h2>
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
        { id: 1, title: 'Beginner Driving Lessons', description: 'A calm, step-by-step start covering controls, road basics and safe habits.' },
        { id: 2, title: 'Pay As You Go', description: 'Flexible lessons you can book around your schedule at a pace that suits you.' },
        { id: 3, title: 'Intensive Courses', description: 'Regular, structured sessions to build momentum and confidence more quickly.' },
        { id: 4, title: 'Fast Track Courses', description: 'A focused, goal-led route for motivated learners who want efficient progress.' },
        { id: 5, title: 'Refresher Lessons', description: 'Targeted practice to rebuild confidence after a break or sharpen specific skills.' },
        { id: 6, title: 'Test Preparation', description: 'Practical coaching on test-ready skills, independent driving and calm decision-making.' },
      ]

      return (
        <>
          <PageHero eyebrow="Driving lessons" title={page.title || 'Driving lessons for every stage of learning'} description={page.description || 'From your first time behind the wheel to focused test preparation, AWO lessons are built around calm coaching, real-road practice and steady progress.'} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src} aside={courseHeroForm}>
            <div className="mt-7 flex flex-wrap gap-3">
              {heroHighlights['driving-lessons'].map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn btn-brass">Talk to AWO <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/courses" className="btn btn-ghost">Explore courses</Link>
            </div>
          </PageHero>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Lesson options</p>
                <h2 className="mt-3 text-3xl display tracking-tight text-slate-950">Choose the format that fits your goals.</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">Each option is designed to support safe, confident driving — whether you’re starting out, returning after a break or working towards your practical test.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courseCards.map(({ title, description }, index) => (
                  <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold">0{index + 1}</div>
                    <h3 className="text-xl font-bold text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                    <Link to="/book" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">Enquire about this option <ArrowRight className="h-4 w-4" /></Link>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Compare at a glance</p>
                <h2 className="mt-3 text-3xl display tracking-tight text-slate-950">A simple guide to choosing a lesson format.</h2>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-950 text-white">
                      <tr>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Option</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Best for</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Pace</th>
                        <th className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]">Focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { course: 'Beginner lessons', best: 'New or nervous drivers', style: 'Step-by-step, steady', focus: 'Controls, routines and safe habits' },
                        { course: 'Pay As You Go', best: 'Learners needing flexibility', style: 'Self-paced', focus: 'Consistent progress around your schedule' },
                        { course: 'Intensive / Fast Track', best: 'Learners wanting momentum', style: 'Regular, structured', focus: 'Skill-building with clear goals' },
                        { course: 'Refresher lessons', best: 'Licensed or returning drivers', style: 'Targeted and calm', focus: 'Confidence, specific skills and road awareness' },
                        { course: 'Test preparation', best: 'Learners nearing a practical test', style: 'Focused practice', focus: 'Test-ready driving and independent decisions' },
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
        { id: 1, name: 'Single lesson', description: 'Book one lesson at a time to keep learning flexible and manageable.', price: 'Ask AWO for current lesson rates' },
        { id: 2, name: 'Regular weekly lessons', description: 'Build consistency with a steady rhythm while keeping the freedom of pay-as-you-go.', price: 'Discuss availability and pricing' },
      ]

      return (
        <>
          <PageHero eyebrow="Pay As You Go" title={page.title || 'Flexible lessons, booked around you'} description={page.description || 'A practical option if you want to learn at your own pace, fit lessons around your schedule, and focus on the skills you need most each week.'} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src} aside={courseHeroForm}>
            <div className="mt-7 flex flex-wrap gap-3">
              {heroHighlights['pay-as-you-go'].map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn btn-brass">Talk to AWO <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/courses" className="btn btn-ghost">Explore courses</Link>
            </div>
          </PageHero>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Why choose Pay As You Go</p>
                  <h2 className="mt-3 text-3xl display text-slate-950">Steady progress without a fixed commitment.</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600">This option suits learners who want flexibility — whether you’re balancing lessons with work or study, building confidence gradually, or topping up practice on specific skills.</p>
                  <ul className="mt-6 space-y-3">
                    {[
                      'Book lesson frequency around your availability',
                      'Focus each session on your current priorities',
                      'Ideal for beginners, refresher practice or targeted improvement',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <div className="grid gap-5">
                  {pricingOptions.map(({ name, description, price }) => (
                    <article key={name} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Lesson option</p>
                      <h2 className="mt-3 text-2xl display text-slate-950">{name}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                      <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Pricing</p>
                        <p className="mt-2 text-lg font-bold text-slate-950">{price || 'Ask for current lesson details'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">How it works</p>
                <h2 className="mt-3 text-3xl display tracking-tight text-slate-950">A simple, flexible way to learn.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Get in touch', body: 'Share your experience, goals and when you’d like to start so we can suggest a suitable lesson plan.' },
                  { title: 'Learn lesson by lesson', body: 'Each session focuses on practical skills and road situations that move your confidence forward.' },
                  { title: 'Review and plan ahead', body: 'After each lesson you’ll know what’s improving and what to work on next, at a pace that suits you.' },
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
      const isFastTrack = slug === 'fast-track-courses'
      const label = isFastTrack ? 'Fast Track Courses' : 'Intensive Courses'
      const highlights = isFastTrack
        ? ['Goal-led lessons', 'Focused training plan', 'Efficient, steady progress']
        : ['Regular practice', 'Structured progression', 'Build momentum safely']

      return (
        <>
          <PageHero eyebrow={label} title={page.title || (isFastTrack ? 'A focused route to confident driving' : 'Structured lessons to build momentum')} description={page.description || (isFastTrack ? 'Designed for motivated learners who want a clear plan, regular practice and practical feedback to progress efficiently.' : 'A structured block of regular lessons to reinforce skills, build routine and grow confidence through consistent practice.')} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src} aside={courseHeroForm}>
            <div className="mt-7 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">{item}</span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn btn-brass">Talk to AWO <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/courses" className="btn btn-ghost">Explore courses</Link>
            </div>
          </PageHero>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">What to expect</p>
                  <h2 className="mt-3 text-3xl display text-slate-950">Structured learning with a clear purpose.</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600">Regular lessons help you retain skills and build confidence faster, but progress is always based on safe control and good judgement — not rushing through the essentials.</p>
                  <ul className="mt-6 space-y-3">
                    {[
                      'A plan tailored to your starting point and goals',
                      'Consistent practice to strengthen routines and awareness',
                      'Honest feedback so you know what to focus on next',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Typical learning journey</p>
                  <h2 className="mt-3 text-3xl display tracking-tight text-slate-950">From foundations to confident, independent driving.</h2>
                  <div className="mt-6 grid gap-4">
                    {[
                      { title: 'Assess and plan', body: 'Discuss your experience, confidence and goals so lessons focus on what matters most.' },
                      { title: 'Build core skills', body: 'Develop vehicle control, observations and safe decision-making across a range of road situations.' },
                      { title: 'Refine and prepare', body: 'Strengthen independence, consistency and calm judgement so you feel ready for everyday driving.' },
                    ].map(({ title, body }, index) => (
                      <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">0{index + 1}</span>
                          <div>
                            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'faqs') {
      const categories = ['All', 'Beginner lessons', 'Courses & formats', 'Booking & availability', 'Test preparation']
      const filteredFaqs = extras?.faqs.length ? extras.faqs.filter((faq) => {
        if (faqFilter === 'All') return true
        const text = `${faq.question} ${faq.answer}`.toLowerCase()
        if (faqFilter === 'Beginner lessons') return /beginner|nervous|new driver|first lesson|start/.test(text)
        if (faqFilter === 'Courses & formats') return /course|pay as you go|fast track|intensive|refresher|lesson/.test(text)
        if (faqFilter === 'Booking & availability') return /availability|book|booking|contact|enquire|arrange|schedule|price|cost/.test(text)
        if (faqFilter === 'Test preparation') return /test|practical|exam|ready/.test(text)
        return true
      }) : [
        { id: 1, question: 'Do you teach complete beginners and nervous drivers?', answer: 'Yes. Lessons can start with the basics in a calm, supportive way and build confidence step by step at a pace that suits you.' },
        { id: 2, question: 'Which lesson option should I choose?', answer: 'It depends on your experience, goals and availability. Pay As You Go offers flexibility, while intensive or fast-track options suit learners who want more regular, structured practice. Get in touch if you’d like guidance.' },
        { id: 3, question: 'Can I focus on specific skills?', answer: 'Yes. Lessons can be tailored to areas like junctions, roundabouts, manoeuvres, parking, or building confidence on busier roads.' },
        { id: 4, question: 'How do I ask about availability and pricing?', answer: 'Use the contact or booking enquiry form to tell us about your goals and preferred times. AWO can discuss current availability, lesson formats and pricing directly.' },
      ]

      return (
        <>
          <PageHero eyebrow="FAQs" title={page.title || 'Helpful answers before you get started'} description={page.description || 'Common questions about lessons, learning options and what to expect when you learn with AWO Driving School.'} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src} />

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
                {filteredFaqs.length > 0 ? filteredFaqs.map(({ id, question, answer }) => (
                  <details key={id} className="group px-5 py-5 sm:px-7" open={id === filteredFaqs[0]?.id}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                      {question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
                  </details>
                )) : (
                  <p className="px-5 py-6 text-sm text-slate-600 sm:px-7">No questions match this category yet. Try another filter or contact AWO directly.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )
    }

    if (slug === 'areas-we-cover') {
      const areas = extras?.areas.length ? extras.areas : [
        { id: 1, name: 'Local roads and everyday routes', description: 'Practise on the kinds of roads you’ll use regularly to build familiarity and confidence.' },
        { id: 2, name: 'Junctions and roundabouts', description: 'Develop observation, positioning and decision-making at common junction types and busy roundabouts.' },
        { id: 3, name: 'Quieter and busier driving environments', description: 'Gain experience in varied traffic conditions so you feel prepared for real-world driving.' },
      ]

      return (
        <>
          <PageHero eyebrow="Areas we cover" title={page.title || 'Learn on roads that matter to you'} description={page.description || 'Lessons can include practice on local routes and the types of roads you’ll drive most, helping you build practical confidence where it counts.'} imageSrc={photos.hero.src} imageAlt={photos.hero.alt} fallbackSrc={photos.hero.src} />

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Local, practical experience</p>
                  <h2 className="mt-3 text-3xl display text-slate-950">Confidence comes from real practice.</h2>
                  <p className="mt-4 text-base leading-7 text-slate-600">Where possible, lessons can include the roads, junctions and traffic conditions you’re likely to face day to day — so skills learned in lessons transfer naturally to independent driving.</p>
                  <ul className="mt-6 space-y-3">
                    {[
                      'Practice on familiar routes to build comfort',
                      'Experience varied road types and traffic levels',
                      'Ask about specific areas or test-centre routes when enquiring',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className="btn btn-primary mt-8">Ask about your area <ArrowRight className="h-4 w-4" /></Link>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {areas.map(({ name, description }, index) => (
                    <article key={name} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold">0{index + 1}</div>
                      <h2 className="text-xl font-bold text-slate-950">{name}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                    </article>
                  ))}
                  {!extrasLoading && extras?.slug === slug && areas.length === 0 ? (
                    <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Coverage details are being updated. Please get in touch to ask about your location.</p>
                  ) : null}
                </div>
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
          <PageHero
            eyebrow="AWO Driving School"
            title={page.title}
            description={page.description}
            imageSrc={photos.hero.src}
            imageAlt={photos.hero.alt}
            fallbackSrc={photos.hero.src}
            minHeight={isLegalPage ? 'min-h-[52vh]' : undefined}
            aside={isCoursePage ? courseHeroForm : undefined}
          >
            <div className="mt-8 flex flex-wrap gap-3">
              {highlightList.map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">{item}</span>
              ))}
            </div>
            {!isLegalPage ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/book" className="btn btn-brass">Talk to AWO <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/courses" className="btn btn-ghost">Explore courses</Link>
              </div>
            ) : null}
            {error ? <p role="status" className="mt-6 text-sm text-amber-100">{error}</p> : null}
          </PageHero>

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
                            <h2 className="mt-3 text-2xl display tracking-tight text-slate-950 sm:text-3xl">{section.heading}</h2>
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
                  <h2 className="mt-2 text-3xl display">Book a lesson and start with confidence.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/book" className="btn btn-brass">
                    Book a lesson <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/courses" className="btn btn-ghost">
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
