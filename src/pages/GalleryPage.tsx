import { ArrowRight, Camera, CarFront, Compass, ShieldCheck } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal'
import { photos } from '../data/photography'

const scenes = [
  {
    image: photos.instructor,
    title: 'Get comfortable with the car',
    description: 'Take time to understand the controls and build a settled start behind the wheel.',
  },
  {
    image: photos.learnerDriver,
    title: 'Practise real road situations',
    description: 'Build awareness and decision-making through practical, focused experience.',
  },
  {
    image: photos.inCarLesson,
    title: 'Grow your confidence',
    description: 'Work through new skills at a pace that gives you room to think and learn.',
  },
  {
    image: photos.compactCar,
    title: 'Prepare for what comes next',
    description: 'Use each lesson to identify a clear next step on your learning journey.',
  },
]

function GalleryPage() {
  return (
    <>
      <Helmet>
        <title>Driving lesson gallery | AWO Driving School</title>
        <meta name="description" content="Explore illustrative scenes representing the skills and experiences learners can work towards with AWO Driving School." />
      </Helmet>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <img
          src={photos.instructor.src}
          alt={photos.instructor.alt}
          width={1440}
          height={1000}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/35" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300"><Camera className="h-4 w-4" /> The learning journey</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">A view of what you can work towards.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Explore a few illustrative scenes inspired by the everyday skills, roads and confidence that come with learning to drive.</p>
            <p className="mt-4 text-xs text-slate-300">These are illustrative stock photographs, not AWO customer or lesson photographs.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Everyday progress</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Confidence is built one experience at a time.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">Lesson content is shaped around your experience and goals. Talk to AWO about what you would like to practise.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {scenes.map((scene, index) => (
              <Reveal key={scene.title} delay={index * 0.06}>
                <article className="group h-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                  <div className="relative overflow-hidden">
                    <img
                      src={scene.image.src}
                      alt={scene.image.alt}
                      width={1440}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">0{index + 1}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-950">{scene.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{scene.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 grid gap-4 rounded-[2rem] bg-slate-950 p-7 text-white sm:grid-cols-3 sm:p-9">
            {[
              { icon: CarFront, title: 'Start with the basics', body: 'Get familiar with the controls and the car.' },
              { icon: Compass, title: 'Practise with purpose', body: 'Choose useful goals for each lesson.' },
              { icon: ShieldCheck, title: 'Build safe habits', body: 'Develop awareness and considered decisions.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><Icon className="h-5 w-5" /></span>
                <div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-slate-950 py-14 text-white sm:py-16">
        <img
          src={photos.roadAwareness.src}
          alt=""
          aria-hidden="true"
          width={1440}
          height={1000}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/75" />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Your journey starts here</p><h2 className="mt-2 text-3xl font-black">Make your next move with AWO.</h2></div>
          <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-emerald-500">Ask about lessons <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  )
}

export default GalleryPage
