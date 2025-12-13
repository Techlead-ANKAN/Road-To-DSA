import { Link, useLocation } from 'react-router-dom'
import { Menu, MoonStar, Sun, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Course', to: '/course' },
  { label: 'Profile', to: '/profile' }
]

export const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useUser()
  const location = useLocation()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isUserMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current || userMenuRef.current.contains(event.target)) return
      setUserMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-surface-border p-2 text-slate-600 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
            aria-label="Road2DSA home"
          >
            <img src="/logo.png" alt="Road2DSA logo" className="h-10 w-auto" />
            <span>Road2DSA</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === item.to ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-surface-border p-2 text-slate-600 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-sm text-slate-600 transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-200"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              <User className="h-4 w-4" />
              <span>{user?.name || 'Guest'}</span>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-surface-border bg-surface p-1 shadow-lg">
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-200"
                  onClick={() => {
                    logout()
                    setUserMenuOpen(false)
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-surface-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'text-sm font-medium hover:text-primary',
                  location.pathname === item.to ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
