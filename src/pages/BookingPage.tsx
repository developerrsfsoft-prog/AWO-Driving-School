import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, Mail, PhoneCall } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const bookingSchema = z.object({
  name: z.string().min(2, 'Please enter your full name.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(8, 'Please enter a valid phone number.'),
  lessonType: z.string().min(1, 'Please choose a lesson type.'),
  goals: z.string().min(10, 'Please tell us a bit more about your goals.'),
  message: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

const defaultValues: BookingFormValues = {
  name: '',
  email: '',
  phone: '',
  lessonType: 'Beginner lessons',
  goals: '',
  message: '',
}

function BookingPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  })

  const onSubmit = (values: BookingFormValues) => {
    const subject = encodeURIComponent(`Driving lesson enquiry from ${values.name}`)
    const body = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone}`,
        `Lesson type: ${values.lessonType}`,
        `Goals: ${values.goals}`,
        values.message ? `Additional notes: ${values.message}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    window.location.assign(`mailto:Awodivingschool@gmail.com?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  return (
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
            <h1 className="mt-4 text-4xl font-black tracking-tight">Start your driving journey.</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Tell us a little about your goals and we’ll get back to you with a suitable lesson plan.
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
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-amber-200">What happens next</p>
              <p className="mt-3 text-sm leading-7 text-white">
                Review the pre-filled message in your email app and press send to complete your enquiry.
                AWO can then reply with current availability and pricing.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
          >
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Enquiry form</h2>
            <p className="mt-2 text-sm text-slate-600">Complete the form to prepare an enquiry email for AWO.</p>

            {submitted ? (
              <div aria-live="polite" className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Your email app should open with a draft.</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Review it and press send. If no email app opens, contact AWO at Awodivingschool@gmail.com.
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Preparing email...' : 'Open enquiry email'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default BookingPage
