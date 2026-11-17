import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/common/AnimatedCounter'
import Reveal from '../components/common/Reveal'
import SectionHeading from '../components/common/SectionHeading'
import {
  contactHighlights,
  heroTraits,
  learningPrinciples,
  practiceAreas,
  processSteps,
  services as designedServices,
  trustBadges,
} from '../data/site'
import { parseHomepagePresentation } from '../data/homepagePresentation'
import { photos } from '../data/photography'
import {
  getPublicFaqs,
  getPublicServices,
  getPublicSettings,
  type PublicFaq,
  type PublicService,
} from '../services/api'

const servicePhotos = [
  photos.compactCar,
  photos.sharedDrive,
  photos.learnerDriver,
  photos.instructor,
  photos.roadAwareness,
  photos.daytimeDriver,
]

const processPhotos = [photos.inCarLesson, photos.instructor, photos.learnerDriver]

function HomePage() {
  const [publicServices, setPublicServices] = useState<PublicService[]>([])
  const [publicFaqs, setPublicFaqs] = useState<PublicFaq[]>([])
  const [publicSettings, setPublicSettings] = useState<Record<string, string> | null>(null)
  const [settingsError, setSettingsError] = useState('')
  const [contentLoading, setContentLoading] = useState(true)
  const [contentError, setContentError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getPublicServices(), getPublicFaqs()])
      .then(([services, faqs]) => {
        if (active) {
          setPublicServices(services)
          setPublicFaqs(faqs)
        }
      })
      .catch(() => {
        if (active) {
          setContentError('Some published homepage content could not be loaded.')
        }
      })
      .finally(() => {
        if (active) {
          setContentLoading(false)
        }
      })

    getPublicSettings()
      .then((settings) => {
        if (active) {
          setPublicSettings(settings)
        }
      })
      .catch(() => {
        if (active) {
          setSettingsError('Contact details could not be loaded.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const presentation = parseHomepagePresentation(publicSettings?.homepage_presentation)
  const { sections } = presentation

  return (
    <div id="top">
      {sections.hero ? (
        <section className="relative isolate min-h-[620px] overflow-hidden bg-slate-950 text-white lg:min-h-[680px]">
          <img
            src={photos.inCarLesson.src}
            alt={photos.inCarLesson.alt}
            width={1440}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[58%_center]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/10" />
          <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:min-h-[680px] lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <Reveal className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Calm, confidence-first tuition
              </p>
              <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-7xl">
                Your next chapter starts{' '}
                <span className="text-emerald-300">behind the wheel.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                Practical driving lessons shaped around your experience, your goals and the confidence you want to build.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/book"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-500"
                >
                  Find your first lesson
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Explore lesson options
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {heroTraits.map((trait) => (
                  <li key={trait} className="inline-flex items-center gap-2 text-sm font-medium text-slate-100">
                    <Check className="h-4 w-4 text-emerald-300" />
                    {trait}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="relative hidden lg:block">
              <figure className="relative ml-auto max-w-[440px] overflow-hidden rounded-[2rem] border border-white/30 bg-white/10 p-2 shadow-2xl shadow-black/30">
                <img
                  src={photos.instructor.src}
                  alt={photos.instructor.alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="h-[400px] w-full rounded-[1.5rem] object-cover object-center"
                />
                <figcaption className="absolute bottom-5 left-5 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                  Illustrative stock photography
                </figcaption>
              </figure>
              <div className="absolute -bottom-5 -left-8 max-w-[250px] rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">A steady start</p>
                <p className="mt-1 font-bold">Build confidence, one lesson at a time.</p>
              </div>
            </Reveal>
          </div>
          <p className="absolute bottom-4 right-5 text-[10px] text-white/75 lg:right-8">
            Illustrative stock photography; not AWO staff.
          </p>
        </section>
      ) : null}

      {sections.approach ? (
        <>
          <section className="bg-white py-16 sm:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <Reveal className="relative">
                <figure className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10">
                  <img
                    src={photos.instructor.src}
                    alt={photos.instructor.alt}
                    width={1440}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                    Illustrative stock photo
                  </figcaption>
                </figure>
                <div className="absolute -bottom-5 right-4 rounded-2xl bg-emerald-700 px-5 py-4 text-white shadow-lg sm:right-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100">Your goals</p>
                  <p className="mt-1 text-lg font-bold">Your pace</p>
                </div>
              </Reveal>
              <div className="pt-4 lg:pt-0">
                <SectionHeading
                  eyebrow="About AWO"
                  title="Want to get your licence and become a confident driver?"
                  description="At AWO Driving School, lessons are focused on helping you feel prepared, supported and comfortable as you learn."
                />
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  We make space for questions, practical experience and useful feedback. Your learning plan can start with the skills you need most and grow with you.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Friendly, confidence-led guidance',
                    'Practice that reflects everyday driving',
                    'Clear next steps after each lesson',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600">
                  More about AWO <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                <SectionHeading
                  eyebrow="Why choose AWO"
                  title="Good lessons make room for real progress."
                  description="A supportive learning environment can help each new road, junction and manoeuvre feel more manageable."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  {learningPrinciples.map((principle, index) => (
                    <Reveal key={principle.title} delay={index * 0.06}>
                      <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">0{index + 1}</span>
                        <h3 className="mt-3 text-lg font-bold text-slate-950">{principle.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{principle.description}</p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="rounded-xl bg-emerald-50 p-2 text-emerald-800"><Icon className="h-5 w-5" /></span>
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {sections.counters && presentation.counters.length > 0 ? (
        <section className="bg-emerald-950 py-14 text-white sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Our progress</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">The numbers that matter to you.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {presentation.counters.map((counter) => (
                <AnimatedCounter key={counter.label} {...counter} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections.lessons ? (
        <section id="services" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Choose your next step"
                title="The right lesson for where you are now."
                description="Explore the published lesson options and ask us about the format that suits your experience and schedule."
              />
              <Link to="/courses" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600">
                All lesson options <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {publicServices.map(({ title, description }, index) => {
                const Icon = designedServices[index % designedServices.length].icon
                const photo = servicePhotos[index % servicePhotos.length]
                return (
                  <Reveal key={title} delay={(index % 3) * 0.05}>
                    <article className="group h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                      <figure className="relative overflow-hidden">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          width={1440}
                          height={1000}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                          Illustrative stock photo
                        </figcaption>
                      </figure>
                      <div className="p-6">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
                        <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{description}</p>
                        <Link to="/book" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                          Ask about this lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
              {contentLoading ? <p className="col-span-full text-center text-slate-500">Loading lessons...</p> : null}
              {!contentLoading && !contentError && publicServices.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">No published lessons are available yet.</p>
              ) : null}
              {contentError ? <p role="status" className="col-span-full text-center text-amber-800">{contentError}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {sections.steps ? (
        <>
          <section className="bg-slate-50 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <SectionHeading
                  eyebrow="Your first steps"
                  title="Getting started is straightforward."
                  description="Start a conversation and find a lesson plan that makes sense for you."
                />
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Share your experience, talk through lesson options and agree on a comfortable next step before you begin.
                </p>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {processSteps.map(({ title, detail, icon: Icon }, index) => {
                  const photo = processPhotos[index % processPhotos.length]
                  return (
                    <Reveal key={title} delay={index * 0.06}>
                      <article className="h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                        <figure className="relative overflow-hidden">
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            width={1440}
                            height={1000}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/10] w-full object-cover"
                          />
                          <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                            Illustrative stock photo
                          </figcaption>
                        </figure>
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">0{index + 1}</span>
                            <Icon className="h-5 w-5 text-emerald-800" />
                          </div>
                          <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                        </div>
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
              <div className="order-2 lg:order-1">
                <SectionHeading
                  eyebrow="Your learning journey"
                  title="Build skills that travel with you."
                  description="Every learner starts from a different place. Take time to practise the situations that matter on your everyday journeys."
                />
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {practiceAreas.slice(0, 4).map((area) => (
                    <div key={area} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      {area}
                    </div>
                  ))}
                </div>
                <Link to="/driving-lessons" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600">
                  Explore driving lessons <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <figure className="relative order-1 overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10 lg:order-2">
                <img
                  src={photos.learnerDriver.src}
                  alt={photos.learnerDriver.alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                  Illustrative stock photo
                </figcaption>
              </figure>
            </div>
          </section>
        </>
      ) : null}

      {sections.practice ? (
        <section className="bg-emerald-950 py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                tone="light"
                eyebrow="A practical approach"
                title="Confidence grows through useful practice."
                description="Lessons can focus on the skills that help you feel more settled in real driving situations."
              />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {practiceAreas.map((area) => (
                  <div key={area} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-50">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {area}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-emerald-100">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <Link to="/areas-we-cover" className="underline decoration-white/30 underline-offset-4 hover:text-white">Ask about areas we cover</Link>
              </div>
            </div>
            <Reveal>
              <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/15 shadow-2xl">
                <img
                  src={photos.roadAwareness.src}
                  alt={photos.roadAwareness.alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-medium text-white">
                  Illustrative stock photo
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>
      ) : null}

      {sections.faq ? (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Good to know"
                title="Questions, answered."
                description="A few helpful details before you take your next step."
              />
              <Link to="/faqs" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600">
                Browse all FAQs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-200 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 sm:px-7">
              {publicFaqs.map(({ id, question, answer }, index) => (
                <details key={id} className="group py-5" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                    {question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 pr-7 text-sm leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
              {contentLoading ? <p className="py-5 text-sm text-slate-500">Loading answers...</p> : null}
              {!contentLoading && !contentError && publicFaqs.length === 0 ? (
                <p className="py-5 text-sm text-slate-500">There are no published answers yet.</p>
              ) : null}
              {contentError ? <p role="status" className="py-5 text-sm text-amber-800">{contentError}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {sections.contact ? (
        <section className="relative isolate overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
          <img
            src={photos.compactCar.src}
            alt={photos.compactCar.alt}
            width={1440}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-slate-950/75" />
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Ready when you are</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Let’s talk about your driving goals.</h2>
              <p className="mt-3 text-base leading-7 text-slate-200">Ask about lesson formats, availability or the best place to begin.</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-100">
                {contactHighlights.map(({ label }) => {
                  const value = label.includes('@') ? publicSettings?.email : publicSettings?.phone
                  return value ? <span key={label}>{value}</span> : null
                })}
                {settingsError ? <span role="status">{settingsError}</span> : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-emerald-500">
                Enquire about lessons <ArrowRight className="h-4 w-4" />
              </Link>
              {publicSettings?.phone ? (
                <a href={`tel:${publicSettings.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10">
                  <PhoneCall className="h-4 w-4" /> Call AWO
                </a>
              ) : null}
            </div>
          </div>
          <p className="mt-8 text-center text-[10px] text-white/70">Illustrative stock photography.</p>
        </section>
      ) : null}

    </div>
  )
}

export default HomePage
