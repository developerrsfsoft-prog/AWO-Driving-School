import { Mail, MapPin, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'
import { openingHours } from '../../data/site'
import Logo from './Logo'

const currentYear = new Date().getFullYear()

const lessonLinks = [
  { label: 'All courses', href: '/courses' },
  { label: 'Beginner lessons', href: '/beginner-driving-lessons' },
  { label: 'Pay as you go', href: '/pay-as-you-go' },
  { label: 'Intensive courses', href: '/intensive-courses' },
  { label: 'Fast-track courses', href: '/fast-track-courses' },
  { label: 'Refresher lessons', href: '/refresher-lessons' },
  { label: 'Test preparation', href: '/test-preparation' },
]

const visitLinks = [
  { label: 'About us', href: '/about' },
  { label: 'Areas we cover', href: '/areas-we-cover' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book a lesson', href: '/book' },
]

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#10211c] text-[#f6f1e7]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c6a15a] to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" light />
            <div>
              <p className="display text-xl text-white">AWO Driving</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8cf8e]">Learn with confidence</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
            Calm, supportive driving tuition for learners, nervous drivers, and anyone ready to feel more confident on the road.
          </p>
        </div>

        <div>
          <h2 className="eyebrow text-[#e8cf8e]">Lessons</h2>
          <ul className="mt-5 space-y-2.5 text-sm text-white/75">
            {lessonLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-[#e8cf8e]">Visit</h2>
          <ul className="mt-5 space-y-2.5 text-sm text-white/75">
            {visitLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-[#e8cf8e]">Contact</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-[#e8cf8e]" />
              <a href="tel:+447465664828" className="transition hover:text-white">+44 7465 664828</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#e8cf8e]" />
              <a href="mailto:Awodivingschool@gmail.com" className="break-all transition hover:text-white">Awodivingschool@gmail.com</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e8cf8e]" />
              <span>Ask about the roads you want to practise.</span>
            </li>
          </ul>
          <p className="mt-5 text-xs leading-6 tracking-wide text-white/55">{openingHours}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-white/50 sm:px-6 lg:flex-row lg:px-8">
          <p>© {currentYear} AWO Driving</p>
          <p className="text-center">Patient instruction. Confidence for every journey.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="transition hover:text-white">Privacy</Link>
            <Link to="/cookie-policy" className="transition hover:text-white">Cookies</Link>
            <Link to="/terms-and-conditions" className="transition hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
