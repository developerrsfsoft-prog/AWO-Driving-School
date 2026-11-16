import { motion } from 'motion/react'
import {
  ArrowRight,
  Check,
  PhoneCall,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../components/common/SectionHeading'
import {
  contactHighlights,
  faqs,
  heroTraits,
  learningPrinciples,
  practiceAreas,
  processSteps,
  services,
  trustBadges,
} from '../data/site'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

function HomePage() {
  return (
    <div id="top">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <motion.div variants={fadeUp}>
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                Supportive driving lessons
              </p>

              <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Learn to drive with calm confidence.
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                AWO Driving School helps nervous learners, beginners and returning drivers build safe habits, improve confidence and stay relaxed behind the wheel.
              </p>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  Book a lesson
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+447465664828"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  <PhoneCall className="h-4 w-4 text-amber-300" />
                  Call now
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
                {heroTraits.map((trait) => (
                  <li key={trait} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4 text-amber-300" />
                    {trait}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} className="relative">
              <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-800 shadow-2xl shadow-slate-950/30">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=85"
                  alt="A learner getting comfortable behind the wheel"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-slate-950/15" />
                <div className="absolute right-5 top-5 rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
                  Your pace. Your progress.
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">A calmer way to learn</p>
                  <h2 className="mt-3 max-w-md text-3xl font-black tracking-tight text-white sm:text-4xl">
                    One lesson at a time.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-200">
                    Make room for questions, practice, and the confidence that comes with each new skill.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {learningPrinciples.map((principle) => (
              <div key={principle.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-lg font-bold text-white">{principle.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-amber-400 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-amber-200">Why learners choose us</p>
              <div className="mt-8 space-y-5">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <span className="rounded-xl bg-white/10 p-2 text-amber-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="About us"
              title="Patient teaching for every stage of your driving journey."
              description="We keep lessons calm, clear and practical so you can build competence without feeling overwhelmed. Whether you’re learning for the first time or getting back behind the wheel, we meet you where you are."
            />

            <div className="mt-8 space-y-4 text-slate-600">
              <p className="text-base leading-7">
                AWO Driving School focuses on safe, confident driving with a clear structure and supportive feedback at every stage. We teach learners to think ahead, react calmly and drive responsibly in real-world situations.
              </p>
              <p className="text-base leading-7">
                Our coaching style is encouraging and realistic. You will build essential road skills, improve decision-making and move toward test readiness with steady progress and practical guidance.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {contactHighlights.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-slate-100 py-20 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our lessons"
            title="Driving tuition tailored around your goals."
            description="From nervous beginners to confident, test-ready drivers, we support each learner with focused, practical coaching."
            align="center"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map(({ title, description, icon: Icon }) => (
              <motion.div
                key={title}
                whileHover={{ y: -6 }}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/60"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="How it works"
                title="A clear path from nervous learner to confident driver."
                description="Our process gives you structure, reassurance and steady progress, without overwhelming you with too much at once."
              />
            </div>

            <div className="space-y-5">
              {processSteps.map(({ title, detail, icon: Icon }, index) => (
                <div key={title} className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-2 inline-flex rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 text-slate-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Skills to practise"
              title="Build the skills for your next step."
              description="Talk with your instructor about the situations you want to understand better, then work through them at a comfortable pace."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {practiceAreas.map((area) => (
                <div key={area} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-slate-700">{area}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="faq" className="rounded-[1.75rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-200/40">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Frequently asked</p>
            <div className="mt-6 space-y-4">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="rounded-2xl border border-white/10 bg-white/5 p-4" open={question === faqs[0].question}>
                  <summary className="cursor-pointer list-none text-left text-base font-semibold text-white">
                    {question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 py-20 text-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 text-center sm:px-6 lg:flex-row lg:text-left lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Ready to begin?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Book your first lesson with AWO Driving School.
            </h2>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Enquire now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+447465664828"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/20 bg-white/20 px-6 py-3 text-sm font-bold transition hover:bg-white/30"
            >
              <PhoneCall className="h-4 w-4" />
              +44 7465 664828
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
