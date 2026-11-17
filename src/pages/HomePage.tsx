import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/common/AnimatedCounter'
import Reveal from '../components/common/Reveal'
import SectionHeading from '../components/common/SectionHeading'
import {
  contactHighlights,
  differentiators,
  heroTraits,
  practiceAreas,
  processSteps,
  services as designedServices,
  trustBadges,
} from '../data/site'
import { parseHomepagePresentation } from '../data/homepagePresentation'
import { photos } from '../data/photography'
import { usePublicPage } from '../hooks/usePublicPage'
import {
  getPublicFaqs,
  getPublicGallery,
  getPublicServices,
  getPublicSettings,
  getPublicTestimonials,
  type PublicFaq,
  type PublicGalleryItem,
  type PublicService,
  type PublicTestimonial,
} from '../services/api'

const servicePhotos = [
  photos.compactCar,
  photos.sharedDrive,
  photos.learnerDriver,
  photos.instructor,
  photos.roadAwareness,
  photos.daytimeDriver,
]

const journeyPhotos = [photos.countryLane, photos.estateLake, photos.streetCoupe, photos.whiteSuv]

function HomePage() {
  const { page: homePage } = usePublicPage('home')
  const [publicServices, setPublicServices] = useState<PublicService[]>([])
  const [publicFaqs, setPublicFaqs] = useState<PublicFaq[]>([])
  const [publicSettings, setPublicSettings] = useState<Record<string, string> | null>(null)
  const [settingsError, setSettingsError] = useState('')
  const [contentLoading, setContentLoading] = useState(true)
  const [contentError, setContentError] = useState('')
  const [gallery, setGallery] = useState<PublicGalleryItem[]>([])
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])

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

    Promise.allSettled([getPublicGallery(), getPublicTestimonials()]).then(([galleryResult, testimonialResult]) => {
      if (!active) return
      if (galleryResult.status === 'fulfilled') setGallery(galleryResult.value)
      if (testimonialResult.status === 'fulfilled') setTestimonials(testimonialResult.value)
    })

    return () => {
      active = false
    }
  }, [])

  const presentation = parseHomepagePresentation(publicSettings?.homepage_presentation)
  const { sections } = presentation
  const heroBg = (homePage?.heroImageUrl || photos.inCarLesson.src)
  const heroAlt = homePage?.heroImageAlt || photos.inCarLesson.alt
  const approachImg = homePage?.sections?.[0]?.imageUrl || photos.instructor.src
  const approachImgAlt = homePage?.sections?.[0]?.imageAlt || photos.instructor.alt
  const ctaImg = homePage?.sections?.[1]?.imageUrl || photos.countryLane.src
  const publishedQuotes = testimonials.filter((item) => (item.quote || item.review || '').trim())

  return (
    <div id="top">
      {sections.hero ? (
        <section className="relative isolate min-h-[92vh] overflow-hidden bg-[#10211c] text-white">
          <img
            src={heroBg}
            alt={heroAlt}
            width={1600}
            height={1100}
            fetchPriority="high"
            decoding="async"
            className="hero-kenburns absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = photos.inCarLesson.src }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10211c]/94 via-[#10211c]/72 to-[#10211c]/20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10211c]/80 via-transparent to-[#10211c]/40" />
          <div className="mx-auto grid min-h-[92vh] max-w-7xl items-end gap-10 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-36">
            <Reveal className="max-w-3xl">
              <p className="eyebrow inline-flex items-center gap-2 text-[#e8cf8e]">
                <ShieldCheck className="h-4 w-4" />
                Calm, confidence-first tuition
              </p>
              <h1 className="display mt-6 text-[2.7rem] leading-[1.02] text-white sm:text-6xl lg:text-[4.6rem]">
                Your next chapter starts <span className="italic text-[#e8cf8e]">behind the wheel.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {homePage?.description || 'Practical driving lessons shaped around your experience, your goals and the confidence you want to build.'}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/book" className="btn btn-brass">
                  Find your first lesson
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/courses" className="btn btn-ghost">
                  Explore lesson options
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
                {heroTraits.map((trait) => (
                  <li key={trait} className="inline-flex items-center gap-2 text-sm font-medium text-white/90">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c6a15a] text-[#10211c]">
                      <Check className="h-3 w-3" />
                    </span>
                    {trait}
                  </li>
                ))}
              </ul>
            </Reveal>

<Reveal className="relative block">
            <div className="relative mx-auto max-w-[420px] rounded-[1.8rem] border border-white/25 bg-white/10 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur lg:ml-auto">
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
          </Reveal>
          </div>
        </section>
      ) : null}

      {sections.approach ? (
        <>
          <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-3 rounded-[1.6rem] border border-[#e3d6c2] bg-[#fffdf8]/95 p-3 shadow-[0_20px_50px_-36px_rgba(16,33,28,0.6)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl px-3 py-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#143028] text-[#e8cf8e]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-[#1c1915]">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#f4efe6] py-20 sm:py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-8">
              <Reveal className="relative">
                <figure className="media-frame relative overflow-hidden rounded-[1.8rem] shadow-[0_30px_60px_-36px_rgba(16,33,28,0.7)]">
                  <img
                    src={approachImg}
                    alt={approachImgAlt}
                    width={1200}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = photos.instructor.src }}
                  />
                </figure>
                <div className="absolute -bottom-5 right-4 rounded-2xl bg-[#143028] px-5 py-4 text-white shadow-lg sm:right-8">
                  <p className="eyebrow text-[#e8cf8e]">Your goals</p>
                  <p className="display mt-1 text-2xl">Your pace</p>
                </div>
              </Reveal>
              <div>
                <SectionHeading
                  eyebrow="About AWO"
                  title="Want to get your licence and become a confident driver?"
                  description={homePage?.sections?.[0]?.body || 'At AWO Driving School, lessons are focused on helping you feel prepared, supported and comfortable as you learn.'}
                />
                <p className="mt-5 max-w-xl text-sm leading-7 text-[#5a5046] sm:text-base">
                  {homePage?.sections?.[1]?.body || 'We make space for questions, practical experience and useful feedback. Your learning plan can start with the skills you need most and grow with you.'}
                </p>
                <ul className="mt-6 space-y-3">
                  {(homePage?.sections?.[0]?.items?.length ? homePage.sections[0].items : [
                    'Friendly, confidence-led guidance',
                    'Practice that reflects everyday driving',
                    'Clear next steps after each lesson',
                  ]).map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-semibold text-[#1c1915]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#143028]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/about" className="btn btn-line mt-8">
                  More about AWO <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-[#fffdf8] py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading
                eyebrow="Why choose AWO"
                title="Instruction that leaves room for real progress."
                description="A supportive lesson can make the next junction, manoeuvre or busy road feel more manageable."
              />
              <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {differentiators.map(({ icon: Icon, title, description }, index) => (
                  <Reveal key={title} delay={(index % 3) * 0.05}>
                    <article className="group h-full rounded-[1.5rem] border border-[#e3d6c2] bg-[#f7f3eb] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c6a15a] hover:bg-white hover:shadow-[0_24px_40px_-28px_rgba(16,33,28,0.45)]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#143028] text-[#e8cf8e] transition group-hover:bg-[#c6a15a] group-hover:text-[#10211c]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="display mt-5 text-2xl text-[#10211c]">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#5a5046]">{description}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {sections.counters && presentation.counters.length > 0 ? (
        <section className="relative overflow-hidden bg-[#10211c] py-16 text-white sm:py-20">
          <img src={photos.duskDrive.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-[#10211c]/80" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="eyebrow text-[#e8cf8e]">Our progress</p>
              <h2 className="display mt-3 text-3xl text-white sm:text-5xl">The numbers that matter to you.</h2>
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
        <section id="services" className="bg-[#f4efe6] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Choose your next step"
                title="The right lesson for where you are now."
                description="Explore the published lesson options and ask us about the format that suits your experience and schedule."
              />
              <Link to="/courses" className="btn btn-line shrink-0">
                All lesson options <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {publicServices.map((svc, index) => {
                const Icon = designedServices[index % designedServices.length].icon
                const fallbackPhoto = servicePhotos[index % servicePhotos.length]
                const photoSrc = svc.image_url || fallbackPhoto.src
                const photoAlt = svc.image_alt || svc.title
                return (
                  <Reveal key={svc.title} delay={(index % 3) * 0.05}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[#e3d6c2] bg-[#fffdf8] shadow-[0_20px_40px_-32px_rgba(16,33,28,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(16,33,28,0.45)]">
                      <figure className="media-frame relative">
                        <img
                          src={photoSrc}
                          alt={photoAlt}
                          width={1200}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[16/10] w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackPhoto.src }}
                        />
                        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fffdf8]/95 text-[#143028] shadow">
                          <Icon className="h-5 w-5" />
                        </span>
                      </figure>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="display text-[1.7rem] leading-tight text-[#10211c]">{svc.title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-7 text-[#5a5046]">{svc.description || svc.summary}</p>
                        <Link to="/book" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#143028]">
                          Ask about this lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
              {contentLoading ? <p className="col-span-full text-center text-[#73685b]">Loading lessons...</p> : null}
              {!contentLoading && !contentError && publicServices.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-[#e3d6c2] bg-white p-6 text-center text-[#5a5046]">No published lessons are available yet.</p>
              ) : null}
              {contentError ? <p role="status" className="col-span-full text-center text-amber-800">{contentError}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {sections.steps ? (
        <section className="bg-[#10211c] py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#e8cf8e]">Your first steps</p>
              <h2 className="display mt-4 text-3xl sm:text-5xl">Getting started is straightforward.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                Share your experience, talk through lesson options and agree on a comfortable next step before you begin.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {processSteps.map(({ title, detail, icon: Icon }, index) => (
                <Reveal key={title} delay={index * 0.06}>
                  <article className="relative h-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6">
                    <div className="flex items-center justify-between">
                      <span className="display text-4xl text-[#c6a15a]">0{index + 1}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#e8cf8e]">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="display mt-8 text-2xl">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{detail}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections.practice ? (
        <section className="bg-[#f4efe6] py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <Reveal>
              <div className="grid grid-cols-2 gap-3">
                <figure className="media-frame col-span-2 overflow-hidden rounded-[1.5rem]">
                  <img src={photos.learnerDriver.src} alt={photos.learnerDriver.alt} width={1200} height={800} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
                </figure>
                <figure className="media-frame overflow-hidden rounded-[1.4rem]">
                  <img src={photos.roadAwareness.src} alt={photos.roadAwareness.alt} width={800} height={800} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                </figure>
                <figure className="media-frame overflow-hidden rounded-[1.4rem]">
                  <img src={photos.daytimeDriver.src} alt={photos.daytimeDriver.alt} width={800} height={800} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                </figure>
              </div>
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="A practical approach"
                title="Confidence grows through useful practice."
                description="Lessons can focus on the skills that help you feel more settled in real driving situations."
              />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {practiceAreas.map((area) => (
                  <div key={area} className="flex items-start gap-3 rounded-2xl border border-[#e3d6c2] bg-[#fffdf8] p-3 text-sm font-medium text-[#3d362f]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#143028]" />
                    {area}
                  </div>
                ))}
              </div>
              <Link to="/areas-we-cover" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#143028]">
                <MapPin className="h-4 w-4" /> Ask about areas we cover
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#fffdf8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="On the road"
              title={gallery.length > 0 ? 'Moments from AWO.' : 'The feel of a lesson.'}
              description={gallery.length > 0 ? 'Photographs published from the AWO gallery.' : 'A look at the roads, cars and quiet focus behind confident driving.'}
            />
            <Link to="/gallery" className="btn btn-line shrink-0">View the gallery <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(gallery.length > 0 ? gallery.slice(0, 4).map((item) => ({
              src: item.image_url,
              alt: item.alt_text || item.title || 'Gallery photograph',
              caption: item.title,
            })) : journeyPhotos.map((photo) => ({
              src: photo.src,
              alt: photo.alt,
              caption: '',
            }))).map((photo, index) => (
              <Reveal key={`${photo.src}-${index}`} delay={index * 0.05}>
                <figure className={`media-frame overflow-hidden rounded-[1.4rem] ${index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover ${index === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = photos.compactCar.src }}
                  />
                  {photo.caption ? (
                    <figcaption className="bg-[#f7f3eb] px-4 py-3 text-sm font-semibold text-[#1c1915]">{photo.caption}</figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {publishedQuotes.length > 0 ? (
        <section className="bg-[#143028] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              tone="light"
              eyebrow="In their words"
              title="What learners have shared."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publishedQuotes.map((item) => {
                const name = item.customer_name || item.name || 'Learner'
                const quote = (item.quote || item.review || '').trim()
                const rating = typeof item.rating === 'number' && item.rating > 0 ? Math.min(5, Math.round(item.rating)) : null
                return (
                  <article key={item.id} className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-6">
                    {rating ? (
                      <div className="mb-4 flex gap-1 text-[#e8cf8e]" aria-label={`${rating} out of 5`}>
                        {Array.from({ length: rating }).map((_, star) => <Star key={star} className="h-4 w-4 fill-current" />)}
                      </div>
                    ) : null}
                    <p className="display text-xl leading-snug text-white">“{quote}”</p>
                    <div className="mt-6 flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.image_alt || name} width={48} height={48} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c6a15a] text-sm font-bold text-[#10211c]">
                          {name.slice(0, 1)}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-white/85">{name}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {sections.faq ? (
        <section className="bg-[#f4efe6] py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Good to know"
                title="Questions, answered."
                description="A few helpful details before you take your next step."
              />
              <Link to="/faqs" className="btn btn-line mt-8">
                Browse all FAQs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-[#e3d6c2] rounded-[1.6rem] border border-[#e3d6c2] bg-[#fffdf8] px-5 sm:px-7">
              {publicFaqs.map(({ id, question, answer }, index) => (
                <details key={id} className="faq-item group py-5" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#10211c]">
                    {question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#143028] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="faq-body mt-3 pr-7 text-sm leading-7 text-[#5a5046]">{answer}</p>
                </details>
              ))}
              {contentLoading ? <p className="py-5 text-sm text-[#73685b]">Loading answers...</p> : null}
              {!contentLoading && !contentError && publicFaqs.length === 0 ? (
                <p className="py-5 text-sm text-[#73685b]">There are no published answers yet.</p>
              ) : null}
              {contentError ? <p role="status" className="py-5 text-sm text-amber-800">{contentError}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {sections.contact ? (
        <section className="relative isolate overflow-hidden bg-[#10211c] py-20 text-white sm:py-24">
          <img
            src={ctaImg}
            alt=""
            aria-hidden="true"
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = photos.compactCar.src }}
          />
          <div className="absolute inset-0 -z-10 bg-[#10211c]/78" />
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#e8cf8e]">Ready when you are</p>
              <h2 className="display mt-4 text-4xl sm:text-6xl">Let’s talk about your driving goals.</h2>
              <p className="mt-4 text-base leading-7 text-white/80">Ask about lesson formats, availability or the best place to begin.</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/85">
                {contactHighlights.map(({ label }) => {
                  const value = label.includes('@') ? publicSettings?.email : publicSettings?.phone
                  return value ? <span key={label}>{value}</span> : null
                })}
                {settingsError ? <span role="status">{settingsError}</span> : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn btn-brass">
                Enquire about lessons <ArrowRight className="h-4 w-4" />
              </Link>
              {publicSettings?.phone ? (
                <a href={`tel:${publicSettings.phone.replace(/[^\d+]/g, '')}`} className="btn btn-ghost">
                  <PhoneCall className="h-4 w-4" /> Call AWO
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default HomePage
