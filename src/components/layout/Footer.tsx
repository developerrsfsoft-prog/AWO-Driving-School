import { Mail, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-base font-black text-slate-950">
              A
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">AWO Driving School</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Learn with confidence</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            Calm, supportive driving tuition for learners, nervous drivers, and anyone ready to feel more confident on the road.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Quick links
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>
              <Link to="/" className="transition hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/#services" className="transition hover:text-white">Lessons</Link>
            </li>
            <li>
              <Link to="/#faq" className="transition hover:text-white">FAQs</Link>
            </li>
            <li>
              <Link to="/book" className="transition hover:text-white">Book a lesson</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Contact
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <PhoneCall className="h-4 w-4 text-amber-300" />
              <a href="tel:+447465664828" className="transition hover:text-white">
                +44 7465 664828
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-300" />
              <a href="mailto:Awodivingschool@gmail.com" className="transition hover:text-white">
                Awodivingschool@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:px-8">
          <p>© {currentYear} AWO Driving School</p>
          <p>Patient instruction. Confidence for every journey.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
