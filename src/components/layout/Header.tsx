import { ChevronDown, Menu, PhoneCall, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import { navItems } from '../../data/site'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="AWO Driving home">
          <Logo className="h-11 w-11" />
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950">AWO Driving</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Learn with confidence</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="flex items-center gap-1">
                  <NavLink to={item.href} className={({ isActive }) => `text-sm font-semibold transition ${isActive ? 'text-emerald-800' : 'text-slate-600 hover:text-slate-950'}`}>
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} menu`}
                    aria-expanded={openDropdown === item.label}
                    onClick={() => setOpenDropdown((current) => current === item.label ? null : item.label)}
                    className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className={`absolute left-0 top-full z-10 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 ${openDropdown === item.label ? 'block' : 'hidden group-hover:block group-focus-within:block'}`}>
                  <Link to={item.href} className="mb-1 block rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 hover:bg-emerald-50">
                    All {item.label}
                  </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
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
                className={({ isActive }) =>
                  `text-sm font-semibold transition ${
                    isActive ? 'text-emerald-800' : 'text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+447465664828"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            <PhoneCall className="h-4 w-4 text-emerald-800" />
            +44 7465 664828
          </a>
          <Link
            to="/book"
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            Register now
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="inline-flex rounded-full border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:px-6">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="flex flex-col">
                  <Link to={item.href} className="px-3 py-2 text-base font-semibold text-slate-900" onClick={() => setMenuOpen(false)}>{item.label}</Link>
                  <div className="ml-3 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
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
                  className={({ isActive }) =>
                    `px-3 py-2 text-base font-semibold ${
                      isActive ? 'text-emerald-800' : 'text-slate-700 hover:text-slate-950'
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ),
            )}
            <Link
              to="/book"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
              onClick={() => setMenuOpen(false)}
            >
              Register now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Header