import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, PhoneCall, ShieldCheck } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import PageHero from '../components/common/PageHero'
import Reveal from '../components/common/Reveal'
import { getPagePhotoSet, resolvePhoto } from '../data/photography'
import { usePublicPage } from '../hooks/usePublicPage'
import { getPublicSettings, submitContact } from '../services/api'

const contactSchema = z.object({
  name: z.string().min(2, 'Please provide your name.'),
  email: z.string().email('Please provide a valid email address.'),
  phone: z.string().min(8, 'Please provide a valid phone number.'),
  message: z.string().min(10, 'Please tell us a little more about your enquiry.'),
})

type ContactFormValues = z.infer<typeof contactSchema>

const defaultValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { page, loading: pageLoading, error: pageError } = usePublicPage('contact')
  const fallbackPhotos = getPagePhotoSet('contact')
  const pagePhotos = {
    hero: resolvePhoto(page?.heroImageUrl ?? page?.bannerImageUrl, fallbackPhotos.hero, page?.heroImageAlt ?? page?.bannerImageAlt),
    sections: fallbackPhotos.sections.map((ph, i) => resolvePhoto(page?.sections?.[i]?.imageUrl, ph, page?.sections?.[i]?.imageAlt)),
  }
  const [settings, setSettings] = useState<Record<string, string> | null>(null)
  const [settingsError, setSettingsError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
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

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError('')
    try {
      await submitContact(values)
      setSubmitted(true)
      reset()
    } catch (error) {
      setSubmitted(false)
      setSubmitError(error instanceof Error ? error.message : 'Your enquiry could not be submitted right now. Please try again.')
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
      <PageHero
        eyebrow="Start a conversation"
        title={page?.title ?? (pageLoading ? 'Contact AWO Driving School' : 'Get in touch with AWO Driving School')}
        description={page?.description ?? 'Whether you’re booking your first lesson, returning to driving, or asking about availability and lesson options, we’re here to help you take the next step with confidence.'}
        imageSrc={pagePhotos.hero.src}
        imageAlt={pagePhotos.hero.alt}
        fallbackSrc={pagePhotos.hero.src}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="#enquiry" className="btn btn-brass">
            Send an enquiry <ArrowRight className="h-4 w-4" />
          </a>
          {settings?.phone ? (
            <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="btn btn-ghost">
              <PhoneCall className="h-4 w-4" /> Call {settings.phone}
            </a>
          ) : null}
          {settings?.email ? (
            <a href={`mailto:${settings.email}`} className="btn btn-ghost">
              <Mail className="h-4 w-4" /> Email us
            </a>
          ) : null}
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-white/85">
          <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#e8cf8e]" /> Friendly, no-pressure advice</li>
          <li className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#e8cf8e]" /> Clear guidance on lesson options</li>
          <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#e8cf8e]" /> Ask about your local area and availability</li>
        </ul>
      </PageHero>
      <section className="bg-slate-50 py-14 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/60 sm:p-8">
            <figure className="relative mb-7 overflow-hidden rounded-2xl">
              <img src={pagePhotos.sections[0].src} alt={pagePhotos.sections[0].alt} width={1440} height={1000} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
            </figure>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Contact AWO</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Let’s find a good place to start.</h2>
            {pageError ? <p role="alert" className="mt-4 text-sm text-amber-200">{pageError}</p> : null}

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <PhoneCall className="h-5 w-5 text-emerald-300" />
                {settings?.phone ? (
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-white hover:text-emerald-200">
                    {settings.phone}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Phone contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <Mail className="h-5 w-5 text-emerald-300" />
                {settings?.email ? (
                  <a href={`mailto:${settings.email}`} className="font-medium text-white hover:text-emerald-200">
                    {settings.email}
                  </a>
                ) : <span className="font-medium text-white">{settingsError || (settings ? 'Email contact is not configured.' : 'Loading contact details...')}</span>}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <MapPin className="h-5 w-5 text-emerald-300" />
                <span className="font-medium text-white">Ask about lessons and the areas you would like to practise.</span>
              </div>
            </div>
            {page?.sections.map((section) => (
              <article key={section.heading} className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="font-bold text-white">{section.heading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{section.body}</p>
                {section.items.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-slate-300">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </article>
            ))}
          </Reveal>

          <Reveal id="enquiry" className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Send an enquiry</h2>
            <p className="mt-2 text-sm text-slate-600">Tell us a little about your goals and what you need help with.</p>

            {submitted ? (
              <div aria-live="polite" className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Your enquiry has been received.</p>
                  <p className="mt-1 text-sm text-emerald-700">AWO will follow up using the contact details you provided.</p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                  <input id="name" {...register('name')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" placeholder="Your name" />
                  {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input id="email" type="email" {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" placeholder="you@example.com" />
                  {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input id="phone" {...register('phone')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" placeholder="+44 7..." />
                {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">Your message</label>
                <textarea id="message" rows={5} {...register('message')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" placeholder="Tell us about your driving goals or questions." />
                {errors.message ? <p className="mt-2 text-sm text-red-600">{errors.message.message}</p> : null}
              </div>

              {submitError ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</p> : null}

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Sending enquiry...' : 'Send enquiry'}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
      </section>
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">What happens next</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">A simple way to get started.</h2>
            <div className="mt-6 space-y-4">
              {[
                { icon: MessageCircle, title: 'Tell us what you need', text: 'Share your experience, questions and the kind of support you are looking for.' },
                { icon: ShieldCheck, title: 'We review your enquiry', text: 'Your message gives us a starting point for discussing lesson options and availability.' },
                { icon: ArrowRight, title: 'Choose a next step', text: 'Talk through a suitable way forward before making any lesson arrangements.' },
              ].map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={index * 0.06}>
                  <article className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Step 0{index + 1}</p>
                      <h3 className="mt-1 font-bold text-slate-950">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
          <figure className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-slate-900/10">
            <img src={pagePhotos.sections[1].src} alt={pagePhotos.sections[1].alt} width={1440} height={1000} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
          </figure>
        </div>
      </section>
    </>
  )
}

export default ContactPage
