import { ChevronDown, Menu, PhoneCall, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navItems } from '../../data/site'
import Logo from './Logo'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const solid = scrolled || menuOpen
  const linkTone = solid ? 'text-[#3d362f] hover:text-[#10211c]' : 'text-white/85 hover:text-white'
  const activeTone = solid ? 'text-[#143028]' : 'text-[#e8cf8e]'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
        solid
          ? 'border-b border-[#e3d6c2] bg-[#f7f3eb]/95 shadow-[0_16px_40px_-28px_rgba(16,33,28,0.55)] backdrop-blur-xl'
          : 'border-b border-transparent bg-gradient-to-b from-[#10211c]/75 to-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="AWO Driving home">
          <Logo className="h-11 w-11 shrink-0" light={!solid} />
          <div className="min-w-0">
            <p className={`display truncate text-lg leading-none ${solid ? 'text-[#10211c]' : 'text-white'}`}>AWO Driving</p>
            <p className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${solid ? 'text-[#73685b]' : 'text-[#e8cf8e]'}`}>
              Learn with confidence
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="flex items-center gap-1">
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => `text-sm font-semibold transition ${isActive ? activeTone : linkTone}`}
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} menu`}
                    aria-expanded={openDropdown === item.label}
                    onClick={() => setOpenDropdown((current) => (current === item.label ? null : item.label))}
                    className={`rounded-full p-1 transition ${solid ? 'text-[#73685b] hover:bg-[#efe8db]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className={`absolute left-1/2 top-full z-20 w-64 -translate-x-1/2 pt-3 ${openDropdown === item.label ? 'block' : 'hidden group-hover:block group-focus-within:block'}`}>
                  <div className="rounded-2xl border border-[#e3d6c2] bg-[#fffdf8] p-2 shadow-[0_24px_50px_-24px_rgba(16,33,28,0.45)]">
                    <Link
                      to={item.href}
                      className="mb-1 block rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#143028] hover:bg-[#f6f0e4]"
                    >
                      All {item.label}
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#3d362f] transition hover:bg-[#f7f3eb] hover:text-[#10211c]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) => `text-sm font-semibold transition ${isActive ? activeTone : linkTone}`}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="tel:+447465664828"
            className={`inline-flex items-center gap-2 text-sm font-semibold transition ${solid ? 'text-[#3d362f] hover:text-[#10211c]' : 'text-white hover:text-[#e8cf8e]'}`}
          >
            <PhoneCall className={`h-4 w-4 ${solid ? 'text-[#143028]' : 'text-[#e8cf8e]'}`} />
            +44 7465 664828
          </a>
          <Link to="/book" className={`btn ${solid ? 'btn-primary' : 'btn-brass'} !min-h-11 !px-5`}>
            Book a lesson
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className={`inline-flex rounded-full border p-2.5 transition lg:hidden ${
            solid ? 'border-[#e3d6c2] text-[#10211c] hover:bg-[#efe8db]' : 'border-white/30 text-white hover:bg-white/10'
          }`}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t border-[#e3d6c2] bg-[#f7f3eb] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="flex flex-col">
                    <Link to={item.href} className="rounded-xl px-3 py-3 text-base font-semibold text-[#10211c]" onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                    <div className="ml-2 flex flex-col border-l border-[#e3d6c2] pl-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="rounded-xl px-3 py-2.5 text-sm text-[#5a5046] hover:bg-white hover:text-[#10211c]"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={({ isActive }) => `rounded-xl px-3 py-3 text-base font-semibold ${isActive ? 'text-[#143028]' : 'text-[#3d362f]'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}
              <a href="tel:+447465664828" className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#143028]">
                <PhoneCall className="h-4 w-4" /> +44 7465 664828
              </a>
              <Link to="/book" className="btn btn-primary mt-2" onClick={() => setMenuOpen(false)}>
                Book a lesson
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Header
