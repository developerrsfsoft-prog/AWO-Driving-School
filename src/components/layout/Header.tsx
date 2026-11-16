import { Menu, PhoneCall, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { navItems } from '../../data/site'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="AWO Driving School home">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-base font-black text-slate-950 shadow-lg shadow-amber-500/30">
            A
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">AWO Driving School</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Learn with confidence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-amber-300' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+447465664828"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-white"
          >
            <PhoneCall className="h-4 w-4 text-amber-300" />
            +44 7465 664828
          </a>
          <Link
            to="/book"
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Book a lesson
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="inline-flex rounded-full border border-white/10 p-2 text-slate-200 lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-slate-950 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `text-base font-medium ${
                    isActive ? 'text-amber-300' : 'text-slate-200 hover:text-white'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/book"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950"
              onClick={() => setMenuOpen(false)}
            >
              Book a lesson
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Header
