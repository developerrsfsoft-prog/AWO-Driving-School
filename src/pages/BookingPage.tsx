import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Mail, MessageCircle, PhoneCall } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
import { z } from 'zod'
import Reveal from '../components/common/Reveal'
import { getPagePhotoSet, resolvePhoto } from '../data/photography'
import { usePublicPage } from '../hooks/usePublicPage'
import { getPublicSettings, submitBooking } from '../services/api'

const bookingSchema = z.object({
  name: z.string().min(2, 'Please enter your full name.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(8, 'Please enter a valid phone number.'),
  lessonType: z.string().min(1, 'Please choose a lesson type.'),
  goals: z.string().min(10, 'Please tell us a bit more about your goals.'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid preferred date.'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Please choose a valid preferred time.'),
  contactPreference: z.enum(['Email', 'Phone', 'Text message'], { error: 'Please choose how we should contact you.' }),
  message: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

const defaultValues: BookingFormValues = {
  name: '',
  email: '',
  phone: '',
  lessonType: 'Beginner lessons',
  goals: '',
  preferredDate: '',
  preferredTime: '',
  contactPreference: 'Email',
  message: '',
}

function BookingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [submitError, setSubmitError] = useState('')
  const { page, loading: pageLoading, error: pageError } = usePublicPage('booking')
  const fallbackPhotos = getPagePhotoSet('booking')
  const pagePhotos = {
    hero: resolvePhoto(page?.heroImageUrl ?? page?.bannerImageUrl, fallbackPhotos.hero, page?.heroImageAlt ?? page?.bannerImageAlt),
    sections: fallbackPhotos.sections.map((ph, i) => resolvePhoto(page?.sections?.[i]?.imageUrl, ph, page?.sections?.[i]?.imageAlt)),
  }
  const [settings, setSettings] = useState<Record<string, string> | null>(null)
  const [settingsError, setSettingsError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  })

  useEffect(() => {
    let active = true
    getPublicSettings()
      .then((data) => {
        if (active) {
          setSettings(data)
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

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitError('')
    try {
      const result = await submitBooking({
        fullName: values.name,
        email: values.email,
        phone: values.phone,
        drivingExperience: values.goals,
        lessonType: values.lessonType,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime,
        contactPreference: values.contactPreference,
        message: values.message,
      })
      setBookingReference(result.bookingReference)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your booking could not be submitted. Please try again.')
    }
  }

  return (
    <>
      {page ? (
        <Helmet>
          <title>{page.seoTitle}</title>
          <meta name="description" content={page.metaDescription} />
        </Helmet>
      ) : null}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800"><CalendarDays className="h-4 w-4" /> Lesson enquiry</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{page?.title ?? (pageLoading ? 'Plan your first lesson' : 'Request a lesson')}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{page?.description ?? 'Share your goals and preferred timing. AWO will follow up to discuss availability and next steps.'}</p>
          </div>
          <figure className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10">
            <img src={pagePhotos.hero.src} alt={pagePhotos.hero.alt} width={1440} height={1000} decoding="async" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700">Illustrative stock photography</figcaption>
          </figure>
        </div>
      </section>
      <section className="bg-slate-50 py-14 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/60 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Book lessons</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">A lesson plan built around your goals.</h2>
            {pageError ? <p role="alert" className="mt-4 text-sm text-amber-200">{pageError}</p> : null}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <PhoneCall className="h-5 w-5 text-emerald-300" />
                {settings?.phone ? (
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-white hover:text-emerald-200">
                    {settings.phone}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Phone contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Mail className="h-5 w-5 text-emerald-300" />
                {settings?.email ? (
                  <a href={`mailto:${settings.email}`} className="font-medium text-white hover:text-emerald-200">
                    {settings.email}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Email contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
            </div>

            <div className="mt-10 space-y-4 rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/10 p-5">
              <p className="text-sm leading-6 text-amber-100">This form sends a lesson request, not a confirmed appointment. AWO will discuss availability and arrangements with you.</p>
              <div className="h-px bg-white/10" />
              {page?.sections.map((section) => (
                <article key={section.heading}>
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">{section.heading}</p>
                  <p className="mt-3 text-sm leading-7 text-white">{section.body}</p>
                  {section.items.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-sm text-slate-200">
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : null}
                </article>
              ))}
              {pageLoading ? <p className="text-sm leading-7 text-white">Loading booking guidance...</p> : null}
              {pageError ? <p className="text-sm leading-7 text-amber-100">{pageError}</p> : null}
              {page && page.sections.length === 0 ? (
                <p className="text-sm leading-7 text-white">There is no published booking guidance yet.</p>
              ) : null}
            </div>
            <figure className="mt-6 overflow-hidden rounded-2xl">
              <img src={pagePhotos.sections[0].src} alt={pagePhotos.sections[0].alt} width={1440} height={1000} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
              <figcaption className="bg-white/10 px-3 py-2 text-[10px] text-slate-200">Illustrative stock photo</figcaption>
            </figure>
          </Reveal>

          <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Enquiry form</h2>
            <p className="mt-2 text-sm text-slate-600">Complete the form to send your lesson request to AWO.</p>

            {submitted ? (
              <div aria-live="polite" className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Your lesson request has been received.</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Your booking reference is <strong>{bookingReference}</strong>. AWO will follow up using your preferred contact method.
                  </p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    id="name"
                    {...register('name')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="Your name"
                  />
                  {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="you@example.com"
                  />
                  {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    id="phone"
                    {...register('phone')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                    placeholder="+44 7..."
                  />
                  {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="lessonType" className="mb-2 block text-sm font-medium text-slate-700">Lesson type</label>
                  <select
                    id="lessonType"
                    {...register('lessonType')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  >
                    <option value="Pay As You Go">Pay As You Go</option>
                    <option value="Fast-Track Courses">Fast-Track Courses</option>
                    <option value="Beginner lessons">Beginner lessons</option>
                    <option value="Refresher courses">Refresher courses</option>
                    <option value="Test preparation">Test preparation</option>
                    <option value="Pass plus">Pass plus</option>
                  </select>
                  {errors.lessonType ? (
                    <p className="mt-2 text-sm text-red-600">{errors.lessonType.message}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="goals" className="mb-2 block text-sm font-medium text-slate-700">Your goals</label>
                <textarea
                  id="goals"
                  {...register('goals')}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  placeholder="Tell us about your current driving experience, anxieties, or targets."
                />
                {errors.goals ? <p className="mt-2 text-sm text-red-600">{errors.goals.message}</p> : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="preferredDate" className="mb-2 block text-sm font-medium text-slate-700">Preferred date</label>
                  <input id="preferredDate" type="date" {...register('preferredDate')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.preferredDate ? <p className="mt-2 text-sm text-red-600">{errors.preferredDate.message}</p> : null}
                </div>
                <div>
                  <label htmlFor="preferredTime" className="mb-2 block text-sm font-medium text-slate-700">Preferred time</label>
                  <input id="preferredTime" type="time" {...register('preferredTime')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" />
                  {errors.preferredTime ? <p className="mt-2 text-sm text-red-600">{errors.preferredTime.message}</p> : null}
                </div>
                <div>
                  <label htmlFor="contactPreference" className="mb-2 block text-sm font-medium text-slate-700">Contact preference</label>
                  <select id="contactPreference" {...register('contactPreference')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500">
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Text message">Text message</option>
                  </select>
                  {errors.contactPreference ? <p className="mt-2 text-sm text-red-600">{errors.contactPreference.message}</p> : null}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">Additional notes</label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  placeholder="Any details you’d like us to know before your first lesson?"
                />
              </div>

              {submitError ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting request...' : 'Request a lesson'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
      </section>
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">A clear way forward</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">From enquiry to first lesson.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ClipboardCheck, title: 'Share your details', text: 'Let us know your lesson preference, current experience and preferred timing.' },
              { icon: MessageCircle, title: 'Discuss availability', text: 'AWO will use your contact preference to follow up about your request.' },
              { icon: CalendarDays, title: 'Confirm arrangements', text: 'Agree on a suitable time and any details directly before the lesson.' },
            ].map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <img
                  src={pagePhotos.sections[index % pagePhotos.sections.length].src}
                  alt={pagePhotos.sections[index % pagePhotos.sections.length].alt}
                  width={1440}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white"><Icon className="h-5 w-5" /></span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Step 0{index + 1}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default BookingPage
