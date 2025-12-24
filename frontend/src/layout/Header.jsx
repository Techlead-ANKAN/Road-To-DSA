import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  MoonStar, 
  Sun, 
  User, 
  ChevronDown, 
  LayoutDashboard,
  Calendar,
  Dumbbell,
  Settings,
  BookOpen,
  Code,
  MessageSquare,
  Globe
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const navSections = [
  { 
    label: 'Dashboard', 
    to: '/', 
    icon: LayoutDashboard 
  },
  { 
    label: 'Productivity', 
    icon: Calendar,
    items: [
      { label: 'Calendar', to: '/productivity-calendar', icon: Calendar },
      { label: 'Gym Tracker', to: '/gym-tracker', icon: Dumbbell },
      { label: 'Gym Admin', to: '/admin/gym-programs', icon: Settings }
    ]
  },
  { 
    label: 'Work', 
    icon: BookOpen,
    items: [
      { label: 'Course', to: '/course', icon: BookOpen },
      { label: 'Visualize', to: '/visualize', icon: Code },
      { label: 'Interview Prep', to: '/interview-prep', icon: MessageSquare },
      { label: 'Web Practice', to: '/web-practice', icon: Globe }
    ]
  }
]

export const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isUserMenuOpen, setUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null)
  const userMenuRef = useRef(null)
  const dropdownRefs = useRef({})

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      
      // Close dropdowns when clicking outside
      const clickedInsideDropdown = Object.values(dropdownRefs.current).some(
        ref => ref && ref.contains(event.target)
      )
      if (!clickedInsideDropdown) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isPathActive = (section) => {
    if (section.to) {
      return location.pathname === section.to
    }
    if (section.items) {
      return section.items.some(item => location.pathname === item.to)
    }
    return false
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-surface-border p-2 text-slate-600 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
            aria-label="Road@Success home"
          >
            <img src="/LOGO_2.png" alt="Road@Success logo" className="h-12 w-auto" />
            
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navSections.map((section, index) => {
            const isActive = isPathActive(section)
            
            if (section.to) {
              // Simple link without dropdown
              return (
                <Link
                  key={section.label}
                  to={section.to}
                  className={clsx(
                    'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
                    isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </Link>
              )
            }
            
            // Dropdown menu
            return (
              <div
                key={section.label}
                className="relative"
                ref={el => dropdownRefs.current[section.label] = el}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === section.label ? null : section.label)}
                  className={clsx(
                    'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
                    isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                  <ChevronDown className={clsx(
                    'h-3 w-3 transition-transform',
                    activeDropdown === section.label && 'rotate-180'
                  )} />
                </button>
                
                {activeDropdown === section.label && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-surface-border bg-surface shadow-lg py-2 z-50">
                    {section.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setActiveDropdown(null)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-surface-muted',
                          location.pathname === item.to
                            ? 'text-primary font-medium'
                            : 'text-slate-600 dark:text-slate-300'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
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
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-surface-border bg-surface p-1 shadow-lg">
                <Link
                  to="/admin/interview-questions"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-200"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Manage Questions
                </Link>
                <Link
                  to="/admin/web-assignments"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-200"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Manage Web Assignments
                </Link>
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
          <div className="flex flex-col space-y-2">
            {navSections.map((section) => {
              if (section.to) {
                return (
                  <Link
                    key={section.to}
                    to={section.to}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation active:scale-95',
                      location.pathname === section.to
                        ? 'text-primary bg-primary/10'
                        : 'text-slate-600 dark:text-slate-300 active:bg-surface-muted'
                    )}
                  >
                    <section.icon className="h-5 w-5" />
                    {section.label}
                  </Link>
                )
              }
              
              return (
                <div key={section.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileActiveDropdown(mobileActiveDropdown === section.label ? null : section.label)
                    }}
                    className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 touch-manipulation active:bg-surface-muted"
                  >
                    <span className="flex items-center gap-3">
                      <section.icon className="h-5 w-5" />
                      {section.label}
                    </span>
                    <ChevronDown
                      className={clsx(
                        'h-4 w-4 transition-transform',
                        mobileActiveDropdown === section.label && 'rotate-180'
                      )}
                    />
                  </button>
                  {mobileActiveDropdown === section.label && (
                    <div className="ml-6 space-y-1 pb-2">
                      {section.items.map((item) => (
                        <button
                          key={item.to}
                          type="button"
                          onClick={() => {
                            navigate(item.to)
                            setMenuOpen(false)
                            setMobileActiveDropdown(null)
                          }}
                          className={clsx(
                            'flex w-full items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors touch-manipulation active:scale-95',
                            location.pathname === item.to
                              ? 'text-primary bg-primary/10 font-medium'
                              : 'text-slate-600 dark:text-slate-300 active:bg-surface-muted'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation active:scale-95',
                location.pathname === '/profile'
                  ? 'text-primary bg-primary/10'
                  : 'text-slate-600 dark:text-slate-300 active:bg-surface-muted'
              )}
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
