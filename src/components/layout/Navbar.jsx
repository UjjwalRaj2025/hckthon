import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, Bell } from 'lucide-react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'
import { NAV_LINKS } from '../../utils/constants'
import { clsx } from 'clsx'

export const Navbar = () => {
  const location        = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Shield size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">ResQAI</span>
              <span className="text-[10px] text-slate-500 font-semibold leading-none mt-0.5">Disaster Response</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map(({ path, label }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200',
                    active
                      ? 'text-blue-600 bg-blue-50 border border-blue-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side — Real Clerk Auth */}
          <div className="flex items-center gap-3">
            <SignedIn>
              {/* Notification bell */}
              <button className="relative h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-orange-500 rounded-full" />
              </button>

              {/* Real Clerk UserButton */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9 rounded-xl border border-slate-200 shadow-sm',
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <Link to="/auth">
                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all">
                  Sign In / Register
                </button>
              </Link>
            </SignedOut>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    location.pathname === path
                      ? 'text-orange-600 bg-orange-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
