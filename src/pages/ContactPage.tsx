import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { CheckCircle2, Mail, MapPin, PhoneCall } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { submitContact } from '../services/api'

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  })

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitContact(values)
      setSubmitted(true)
      reset()
    } catch {
      setSubmitted(false)
      window.alert('Your enquiry could not be submitted right now. Please try again or call the school directly.')
    }
  }

  return (
    <section className="bg-slate-50 py-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-200/60"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Contact AWO</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">We are here to help.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Ask about lessons, confidence goals, availability or the next step in your driving journey.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <PhoneCall className="h-5 w-5 text-amber-300" />
                <a href="tel:+447465664828" className="font-medium text-white hover:text-amber-200">
                  +44 7465 664828
                </a>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Mail className="h-5 w-5 text-amber-300" />
                <a href="mailto:Awodivingschool@gmail.com" className="font-medium text-white hover:text-amber-200">
                  Awodivingschool@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <MapPin className="h-5 w-5 text-amber-300" />
                <span className="font-medium text-white">Local learner support across the areas you drive in.</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
          >
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
                  <input id="name" {...register('name')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="Your name" />
                  {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input id="email" type="email" {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="you@example.com" />
                  {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input id="phone" {...register('phone')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="+44 7..." />
                {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p> : null}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-700">Your message</label>
                <textarea id="message" rows={5} {...register('message')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-amber-400" placeholder="Tell us about your driving goals or questions." />
                {errors.message ? <p className="mt-2 text-sm text-red-600">{errors.message.message}</p> : null}
              </div>

              <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Sending enquiry...' : 'Send enquiry'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
