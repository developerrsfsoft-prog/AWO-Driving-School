import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, Mail, PhoneCall } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
import { z } from 'zod'
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
      <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-200/60"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Book lessons</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">
              {page?.title ?? (pageLoading ? 'Loading booking details...' : 'Booking details unavailable')}
            </h1>
            {page ? <p className="mt-4 text-base leading-7 text-slate-300">{page.description}</p> : null}
            {pageError ? <p role="alert" className="mt-4 text-sm text-amber-200">{pageError}</p> : null}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <PhoneCall className="h-5 w-5 text-amber-300" />
                {settings?.phone ? (
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-white hover:text-amber-200">
                    {settings.phone}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Phone contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Mail className="h-5 w-5 text-amber-300" />
                {settings?.email ? (
                  <a href={`mailto:${settings.email}`} className="font-medium text-white hover:text-amber-200">
                    {settings.email}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Email contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
            </div>

            <div className="mt-10 space-y-4 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5">
              {page?.sections.map((section) => (
                <article key={section.heading}>
                  <p className="text-sm uppercase tracking-[0.2em] text-amber-200">{section.heading}</p>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
          >
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                    placeholder="+44 7..."
                  />
                  {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="lessonType" className="mb-2 block text-sm font-medium text-slate-700">Lesson type</label>
                  <select
                    id="lessonType"
                    {...register('lessonType')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                  >
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                  placeholder="Tell us about your current driving experience, anxieties, or targets."
                />
                {errors.goals ? <p className="mt-2 text-sm text-red-600">{errors.goals.message}</p> : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="preferredDate" className="mb-2 block text-sm font-medium text-slate-700">Preferred date</label>
                  <input id="preferredDate" type="date" {...register('preferredDate')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
                  {errors.preferredDate ? <p className="mt-2 text-sm text-red-600">{errors.preferredDate.message}</p> : null}
                </div>
                <div>
                  <label htmlFor="preferredTime" className="mb-2 block text-sm font-medium text-slate-700">Preferred time</label>
                  <input id="preferredTime" type="time" {...register('preferredTime')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" />
                  {errors.preferredTime ? <p className="mt-2 text-sm text-red-600">{errors.preferredTime.message}</p> : null}
                </div>
                <div>
                  <label htmlFor="contactPreference" className="mb-2 block text-sm font-medium text-slate-700">Contact preference</label>
                  <select id="contactPreference" {...register('contactPreference')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400">
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400"
                  placeholder="Any details you’d like us to know before your first lesson?"
                />
              </div>

              {submitError ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || submitted}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting request...' : 'Request a lesson'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      </section>
    </>
  )
}

export default BookingPage
