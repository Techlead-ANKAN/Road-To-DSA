import { Link, useLocation } from 'react-router-dom'
import { Menu, MoonStar, Sun, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Course', to: '/course' },
  { label: 'Profile', to: '/profile' }
]

export const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()
  const location = useLocation()
  const [isMenuOpen, setMenuOpen] = useState(false)

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
          <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Road to DSA
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
          <div className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-sm text-slate-600 dark:text-slate-200">
            <User className="h-4 w-4" />
            <span>{user?.name || 'Guest'}</span>
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
