# Design & UI Guidelines Template

> **Purpose**: This document captures the design system, UI patterns, and architectural structure used in the Road2DSA project. Use this as a reference for maintaining consistency or as a comprehensive guide when building similar modern web applications.

---

## 📋 Table of Contents
1. [Tech Stack & Dependencies](#tech-stack--dependencies)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Patterns](#component-patterns)
7. [UI Component Library](#ui-component-library)
8. [State Management](#state-management)
9. [Routing & Navigation](#routing--navigation)
10. [Forms & Inputs](#forms--inputs)
11. [Buttons & Interactive Elements](#buttons--interactive-elements)
12. [Cards & Containers](#cards--containers)
13. [Modals & Overlays](#modals--overlays)
14. [Data Visualization](#data-visualization)
15. [Responsive Design](#responsive-design)
16. [Dark Mode Implementation](#dark-mode-implementation)
17. [Accessibility Guidelines](#accessibility-guidelines)
18. [Animation & Transitions](#animation--transitions)
19. [File Structure](#file-structure)
20. [Best Practices](#best-practices)

---

## Tech Stack & Dependencies

### Core Technologies
```json
{
  "framework": "React 19.2.0",
  "bundler": "Vite 7.2.4",
  "styling": "TailwindCSS 3.4.17",
  "routing": "React Router DOM 7.2.0",
  "state": "@tanstack/react-query 5.62.5"
}
```

### Key Libraries
- **UI/Styling**: `clsx` (conditional classes), `lucide-react` (icons)
- **Forms & Validation**: Native React state
- **Data Fetching**: `axios` + React Query
- **Notifications**: `react-hot-toast`
- **Code Editor**: `@monaco-editor/react`
- **Charts**: `recharts`
- **Date Handling**: `dayjs`

### Development Tools
- ESLint for code quality
- PostCSS with Autoprefixer
- TypeScript-ready (types included)

---

## Design Philosophy

### Core Principles
1. **Clean & Minimal** - Focus on content, reduce visual noise
2. **Consistent** - Uniform spacing, colors, and components
3. **Accessible** - ARIA labels, keyboard navigation, semantic HTML
4. **Responsive** - Mobile-first approach with progressive enhancement
5. **Professional** - Modern, polished interface suitable for productivity apps

### Visual Hierarchy
- Primary actions use `primary` color (blue)
- Secondary actions use `surface-border` with hover states
- Destructive actions use rose/red variants
- Success states use emerald/green
- Warning states use amber/yellow

---

## Color System

### Tailwind Configuration
```javascript
colors: {
  primary: {
    DEFAULT: '#2563eb',  // Blue-600
    light: '#60a5fa',    // Blue-400
    dark: '#1d4ed8'      // Blue-700
  },
  surface: {
    DEFAULT: '#ffffff',   // White
    muted: '#f8fafc',     // Slate-50
    border: '#e2e8f0'     // Slate-200
  }
}
```

### Semantic Color Usage
- **Text Colors**:
  - Primary text: `text-slate-900 dark:text-slate-100`
  - Secondary text: `text-slate-600 dark:text-slate-300`
  - Muted text: `text-slate-500`

- **Difficulty/Status Colors**:
  - Easy: `emerald` (#10b981)
  - Medium: `amber` (#f59e0b)
  - Hard: `rose` (#ef4444)

- **Background Colors**:
  - Page background: `bg-surface-muted` (#f3f4f6)
  - Card background: `bg-surface`
  - Hover states: `hover:bg-surface-muted`

### Dark Mode Colors
Dark mode is achieved through Tailwind's `dark:` variant system:
- Background: `dark:bg-slate-950`
- Text: `dark:text-slate-100`
- Borders: `dark:border-slate-800`

---

## Typography

### Font Configuration
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Text Scales
- **Headings**:
  - H1: `text-2xl font-semibold` (24px)
  - H2: `text-xl font-semibold` (20px)
  - H3: `text-lg font-semibold` (18px)
  - H4: `text-base font-semibold` (16px)

- **Body Text**:
  - Regular: `text-sm` (14px)
  - Small: `text-xs` (12px)
  - Micro: `text-[10px]` (10px)

- **Font Weights**:
  - Regular: `font-normal` (400)
  - Medium: `font-medium` (500)
  - Semibold: `font-semibold` (600)
  - Bold: `font-bold` (700)

### Special Text Styles
- **Uppercase labels**: `text-xs font-semibold uppercase tracking-wide`
- **Code/Monospace**: Use `@monaco-editor/react` for code blocks
- **Links**: `hover:text-primary transition-colors`

---

## Spacing & Layout

### Container System
```jsx
// App-wide container
<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  {children}
</div>
```

### Spacing Scale (Tailwind defaults)
- `gap-2`: 0.5rem (8px)
- `gap-3`: 0.75rem (12px)
- `gap-4`: 1rem (16px)
- `gap-6`: 1.5rem (24px)
- `gap-8`: 2rem (32px)

### Grid Layouts
```jsx
// Stat cards (responsive)
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

// Two-column layout
<div className="grid gap-6 lg:grid-cols-2">

// Sidebar + content
<div className="grid gap-6 lg:grid-cols-[320px,1fr]">
```

---

## Component Patterns

### Component Structure
All components follow this pattern:
```jsx
import { useState } from 'react'
import clsx from 'clsx'
import { Icon } from 'lucide-react'

export const ComponentName = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(initialValue)
  
  return (
    <div className={clsx(
      'base-classes',
      conditionalClass && 'conditional-classes'
    )}>
      {/* Component content */}
    </div>
  )
}
```

### Naming Conventions
- Components: PascalCase (`SmallStatCard.jsx`)
- Utilities/Hooks: camelCase (`useProgressData.js`)
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case (via Tailwind)

---

## UI Component Library

### 1. SmallStatCard
**Purpose**: Display key metrics with icon
```jsx
<SmallStatCard 
  label="Overall completion"
  value="45%"
  helper="23 solved"
  icon={Trophy}
  accent="primary|emerald|rose|amber"
/>
```

**Design Features**:
- Rounded corners: `rounded-2xl`
- Hover effect: `hover:-translate-y-0.5 hover:shadow-lg`
- Icon badge with colored background
- Custom shadow: `shadow-card`

### 2. StepAccordion
**Purpose**: Navigation sidebar for course steps
```jsx
<StepAccordion
  steps={steps}
  selectedStep={0}
  onSelectStep={setSelectedStep}
  progressSummary={metrics}
/>
```

**Design Features**:
- Full-width buttons with consistent padding
- Progress bar with percentage
- Active state: `ring-2 ring-primary/40`
- Uppercase step label with tracking

### 3. ProblemRow
**Purpose**: Interactive problem item with actions
```jsx
<ProblemRow
  problem={problem}
  progress={progressRecord}
  indices={indices}
  onToggleComplete={handler}
  onOpenCode={handler}
  onLogRevision={handler}
/>
```

**Design Features**:
- Grid layout: `grid-cols-[auto,1fr,auto,auto]`
- Checkbox for completion
- Multiple action buttons
- Conditional styling when completed
- Popover for revision logging

### 4. FilterBar
**Purpose**: Search and filter controls
```jsx
<FilterBar
  search={search}
  onSearchChange={setSearch}
  difficulty={difficulty}
  onDifficultyChange={setDifficulty}
/>
```

**Design Features**:
- Search input with icon prefix
- Dropdown select for filtering
- Responsive flex layout

### 5. CodeModal
**Purpose**: Full-screen modal for code editing
```jsx
<CodeModal
  open={isOpen}
  onClose={closeHandler}
  onSave={saveHandler}
  problemName="Two Sum"
  initialData={codeData}
/>
```

**Design Features**:
- Portal-based overlay
- Monaco code editor integration
- Split layout: code + notes
- Fixed header and footer
- Dark mode support

### 6. ProgressBadge
**Purpose**: Difficulty indicator
```jsx
<ProgressBadge difficulty="Easy|Medium|Hard" />
```

**Design Features**:
- Color-coded by difficulty
- Small, uppercase text
- Rounded full pill shape

### 7. DashboardCharts
**Purpose**: Data visualization (pie + bar charts)
```jsx
<DashboardCharts
  difficulty={difficultyData}
  steps={stepsData}
/>
```

**Design Features**:
- Recharts library integration
- Responsive container
- Custom colors matching theme
- Grid layout for multiple charts

### 8. RecentActivity
**Purpose**: Display recent completions and revisions
```jsx
<RecentActivity
  activity={lastCompleted}
  revision={lastRevision}
/>
```

**Design Features**:
- Conditional rendering based on data
- Color-coded cards
- Status badges
- Formatted timestamps

### 9. UserSetupCard
**Purpose**: Onboarding form for new users
```jsx
<UserSetupCard />
```

**Design Features**:
- Centered card layout
- Form validation
- Loading states
- Toast notifications

---

## State Management

### React Query Pattern
```jsx
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  enabled: Boolean(id)
})

// Mutations
const mutation = useMutation({
  mutationFn: updateResource,
  onSuccess: (data) => {
    queryClient.setQueryData(['resource', id], data)
    toast.success('Updated')
  },
  onError: (error) => toast.error(error.message)
})
```

### Context Pattern
```jsx
// ThemeContext.jsx
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('key', 'light')
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### Custom Hooks
```jsx
// useProgressData.js
export const useProgressData = ({ userId, courseId, enabled = true }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['progress', userId, courseId],
    queryFn: () => fetchProgress(userId, courseId),
    enabled: enabled && Boolean(userId) && Boolean(courseId)
  })
  
  return {
    progress: data,
    metrics: data?.metrics,
    isLoading,
    error
  }
}
```

---

## Routing & Navigation

### Route Structure
```jsx
<BrowserRouter>
  <AppLayout>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/course" element={<CoursePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppLayout>
</BrowserRouter>
```

### Navigation Component
```jsx
const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Course', to: '/course' },
  { label: 'Profile', to: '/profile' }
]

// Active link styling
<Link
  to={item.to}
  className={clsx(
    'text-sm font-medium transition-colors hover:text-primary',
    location.pathname === item.to 
      ? 'text-primary' 
      : 'text-slate-600 dark:text-slate-300'
  )}
>
```

### Layout Pattern
```jsx
export const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

---

## Forms & Inputs

### Input Field Pattern
```jsx
<div>
  <label 
    htmlFor="field-id" 
    className="text-sm font-medium text-slate-600"
  >
    Label
  </label>
  <input
    id="field-id"
    type="text"
    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
    placeholder="Placeholder"
    autoComplete="name"
  />
</div>
```

### Search Input with Icon
```jsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  <input
    type="search"
    className="w-full rounded-lg border border-surface-border pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
    placeholder="Search"
  />
</div>
```

### Select Dropdown
```jsx
<select
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

### Textarea
```jsx
<textarea
  rows={3}
  className="w-full resize-none rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
  placeholder="Notes"
/>
```

### Checkbox
```jsx
<input
  type="checkbox"
  checked={isChecked}
  onChange={(e) => setChecked(e.target.checked)}
  className="h-5 w-5 rounded border border-slate-300 text-primary focus:ring-primary"
/>
```

---

## Buttons & Interactive Elements

### Primary Button
```jsx
<button
  type="button"
  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-80"
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Save'}
</button>
```

### Secondary Button (Outline)
```jsx
<button
  type="button"
  className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
>
  Cancel
</button>
```

### Icon Button
```jsx
<button
  type="button"
  className="rounded-full p-2 text-slate-600 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
  aria-label="Action name"
>
  <Icon className="h-5 w-5" />
</button>
```

### Button with Icon
```jsx
<button
  type="button"
  className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary"
>
  <Icon className="h-4 w-4" />
  Label
</button>
```

### Toggle Button Group
```jsx
<div className="flex gap-2">
  <button
    type="button"
    onClick={() => setValue('option1')}
    className={clsx(
      'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition',
      value === 'option1'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
        : 'border-surface-border text-slate-600 hover:border-primary'
    )}
  >
    Option 1
  </button>
</div>
```

---

## Cards & Containers

### Standard Card
```jsx
<div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
  <h3 className="text-sm font-medium text-slate-500">Card Title</h3>
  <div className="mt-4">
    {/* Card content */}
  </div>
</div>
```

### Interactive Card (Hover)
```jsx
<div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
  {/* Content */}
</div>
```

### Highlighted Card (Success/Completion)
```jsx
<div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/20">
  {/* Content */}
</div>
```

### Alert/Error Card
```jsx
<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
  Error message here
</div>
```

### Loading State Card
```jsx
<div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
  Loading...
</div>
```

---

## Modals & Overlays

### Modal Pattern (Portal-based)
```jsx
import { createPortal } from 'react-dom'

export const Modal = ({ open, onClose, children }) => {
  if (!open) return null
  
  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h3 className="text-lg font-semibold">Modal Title</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-surface-border px-6 py-4">
          <button onClick={onClose}>Cancel</button>
          <button>Confirm</button>
        </div>
      </div>
    </div>
  )
  
  return createPortal(content, document.body)
}
```

### Popover/Dropdown Pattern
```jsx
const [isOpen, setOpen] = useState(false)
const ref = useRef(null)

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (!ref.current || ref.current.contains(event.target)) return
    setOpen(false)
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

return (
  <div className="relative" ref={ref}>
    <button onClick={() => setOpen(!isOpen)}>Toggle</button>
    {isOpen && (
      <div className="absolute right-0 mt-2 w-40 rounded-lg border border-surface-border bg-surface p-1 shadow-lg">
        {/* Popover content */}
      </div>
    )}
  </div>
)
```

---

## Data Visualization

### Chart Configuration (Recharts)
```jsx
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

// Pie Chart
<div className="h-64">
  <ResponsiveContainer>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell key={entry.name} fill={colors[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>

// Bar Chart
<div className="h-64">
  <ResponsiveContainer>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} />
      <YAxis axisLine={false} tickLine={false} />
      <Tooltip />
      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
    </BarChart>
  </ResponsiveContainer>
</div>
```

### Progress Bar
```jsx
<div className="h-2 w-full rounded-full bg-slate-100">
  <div
    className="h-full rounded-full bg-primary transition-all"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## Responsive Design

### Breakpoint System (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile Menu Pattern
```jsx
const [isMenuOpen, setMenuOpen] = useState(false)

return (
  <>
    {/* Desktop nav - hidden on mobile */}
    <nav className="hidden items-center gap-8 md:flex">
      {navItems.map(item => (
        <Link key={item.to} to={item.to}>{item.label}</Link>
      ))}
    </nav>
    
    {/* Mobile menu button */}
    <button 
      className="md:hidden"
      onClick={() => setMenuOpen(!isMenuOpen)}
    >
      <Menu className="h-5 w-5" />
    </button>
    
    {/* Mobile menu */}
    {isMenuOpen && (
      <nav className="border-t md:hidden">
        {navItems.map(item => (
          <Link key={item.to} to={item.to}>{item.label}</Link>
        ))}
      </nav>
    )}
  </>
)
```

### Responsive Grid Patterns
```jsx
// Single column → 2 cols → 5 cols
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

// Sidebar stacks on mobile
<div className="grid gap-6 lg:grid-cols-[320px,1fr]">

// Flex wraps on mobile
<div className="flex flex-col gap-4 md:flex-row md:items-center">
```

---

## Dark Mode Implementation

### Setup
```jsx
// ThemeContext.jsx
const [theme, setTheme] = useLocalStorage('app-theme', 'light')

useEffect(() => {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}, [theme])
```

### Dark Mode Classes
```jsx
// Background
className="bg-surface dark:bg-slate-950"

// Text
className="text-slate-900 dark:text-slate-100"

// Borders
className="border-surface-border dark:border-slate-800"

// Hover states
className="hover:bg-surface-muted dark:hover:bg-slate-900"
```

### Toggle Button
```jsx
<button onClick={toggleTheme}>
  {theme === 'light' 
    ? <MoonStar className="h-5 w-5" /> 
    : <Sun className="h-5 w-5" />
  }
</button>
```

---

## Accessibility Guidelines

### Semantic HTML
- Use `<button>` for clickable actions
- Use `<a>` for navigation links
- Use `<label>` for form inputs
- Use headings (`<h1>` - `<h6>`) in logical order

### ARIA Attributes
```jsx
// Labels for icon buttons
<button aria-label="Close modal">
  <X className="h-5 w-5" />
</button>

// Expanded state for dropdowns
<button 
  aria-expanded={isOpen}
  aria-haspopup="menu"
>

// Disabled state for links
<a 
  href={url}
  aria-disabled={!url}
  className={!url && 'cursor-not-allowed'}
>
```

### Keyboard Navigation
- All interactive elements receive `focus:outline-none focus:ring-2 focus:ring-primary`
- Tab order follows visual layout
- Modals trap focus
- Escape key closes modals/dropdowns

### Focus Indicators
```jsx
// Standard focus ring
className="focus:outline-none focus:ring-2 focus:ring-primary"

// Reduced opacity for subtle elements
className="focus:ring-2 focus:ring-primary/40"
```

---

## Animation & Transitions

### Standard Transitions
```jsx
// Smooth color/bg transitions
className="transition hover:bg-primary"

// Transform on hover (lift effect)
className="transition hover:-translate-y-0.5 hover:shadow-lg"

// All properties
className="transition-all"
```

### Loading States
```jsx
// Button with loading
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Skeleton/placeholder
<div className="animate-pulse bg-slate-200 h-4 w-full rounded" />
```

### Enter/Exit Animations
```jsx
// Conditional rendering with fade
{isVisible && (
  <div className="animate-fade-in">
    Content
  </div>
)}
```

---

## File Structure

```
frontend/
├── public/               # Static assets
│   └── logo.png
├── src/
│   ├── api/             # API client functions
│   │   ├── client.js    # Axios instance
│   │   ├── course.js
│   │   ├── progress.js
│   │   └── user.js
│   ├── components/      # Reusable UI components
│   │   ├── CodeModal.jsx
│   │   ├── DashboardCharts.jsx
│   │   ├── FilterBar.jsx
│   │   ├── ProblemRow.jsx
│   │   ├── ProgressBadge.jsx
│   │   ├── RecentActivity.jsx
│   │   ├── SmallStatCard.jsx
│   │   ├── StepAccordion.jsx
│   │   └── UserSetupCard.jsx
│   ├── context/         # React Context providers
│   │   ├── ThemeContext.jsx
│   │   └── UserContext.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useLocalStorage.js
│   │   └── useProgressData.js
│   ├── layout/          # Layout components
│   │   ├── AppLayout.jsx
│   │   └── Header.jsx
│   ├── pages/           # Page components (routes)
│   │   ├── Course.jsx
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### File Organization Principles
1. **Components** - Pure, reusable UI building blocks
2. **Pages** - Route-level components that compose smaller components
3. **Layout** - Shared layout wrappers (Header, Footer, Sidebar)
4. **Context** - Global state providers
5. **Hooks** - Reusable stateful logic
6. **API** - Data fetching layer
7. **Utils** - Helper functions

---

## Best Practices

### Component Design
1. **Single Responsibility** - Each component does one thing well
2. **Props Interface** - Clear, documented prop types
3. **Controlled Components** - State managed by parent
4. **Composition over Inheritance** - Build with smaller pieces
5. **Error Boundaries** - Graceful error handling

### State Management
1. **Server State** - React Query for API data
2. **UI State** - Local useState for component-specific state
3. **Global State** - Context for theme, user, etc.
4. **URL State** - React Router for navigation state
5. **Local Storage** - Persistent user preferences

### Performance
1. **Code Splitting** - Dynamic imports for large components
2. **Memoization** - `useMemo` for expensive computations
3. **Virtual Lists** - For long lists (if needed)
4. **Image Optimization** - Lazy loading, proper formats
5. **Bundle Analysis** - Regular checks on bundle size

### Code Quality
1. **Consistent Formatting** - ESLint configuration
2. **TypeScript Ready** - Type definitions included
3. **Component Comments** - Document complex logic
4. **Prop Validation** - Use PropTypes or TypeScript
5. **Test Coverage** - Unit tests for critical paths

### Styling Guidelines
1. **Utility First** - Prefer Tailwind classes over custom CSS
2. **Component Variants** - Use `clsx` for conditional styles
3. **Consistent Spacing** - Stick to Tailwind's scale
4. **Color Consistency** - Use design tokens
5. **Responsive First** - Mobile-first approach

### API Integration
1. **Error Handling** - Graceful degradation
2. **Loading States** - Always show feedback
3. **Optimistic Updates** - Immediate UI response
4. **Cache Invalidation** - Keep data fresh
5. **Request Cancellation** - Cleanup on unmount

---

## Common Patterns Reference

### Loading State Pattern
```jsx
if (isLoading) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
      Loading...
    </div>
  )
}
```

### Error State Pattern
```jsx
if (error) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
      {error.message}
    </div>
  )
}
```

### Empty State Pattern
```jsx
if (!data || data.length === 0) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
      No data available
    </div>
  )
}
```

### Conditional Class Pattern
```jsx
import clsx from 'clsx'

<div className={clsx(
  'base-classes',
  isActive && 'active-classes',
  !isActive && 'inactive-classes',
  variant === 'primary' && 'primary-variant-classes'
)}>
```

### Form Submission Pattern
```jsx
const [form, setForm] = useState(initialForm)

const handleSubmit = (event) => {
  event.preventDefault()
  
  // Validation
  if (!form.field) {
    toast.error('Field is required')
    return
  }
  
  // Submit
  mutation.mutate(form)
}

const handleChange = (field) => (event) => {
  setForm(prev => ({ ...prev, [field]: event.target.value }))
}
```

### Toast Notification Pattern
```jsx
import toast from 'react-hot-toast'

// Success
toast.success('Action completed')

// Error
toast.error(error.message)

// Loading
const toastId = toast.loading('Processing...')
// Later: toast.dismiss(toastId)
```

---

## Quick Start Checklist

When starting a new project with this design system:

- [ ] Install dependencies: `npm install`
- [ ] Configure Tailwind with custom theme
- [ ] Set up ESLint and formatting rules
- [ ] Create folder structure (api, components, pages, etc.)
- [ ] Set up React Query with QueryClientProvider
- [ ] Implement ThemeContext for dark mode
- [ ] Create AppLayout with Header
- [ ] Set up routing with React Router
- [ ] Configure toast notifications
- [ ] Add Inter font via Google Fonts
- [ ] Create base components (buttons, inputs, cards)
- [ ] Implement responsive navigation
- [ ] Add loading and error state components
- [ ] Configure environment variables
- [ ] Test dark mode across all pages

---

## Design Resources

### Icons
- **Library**: Lucide React
- **Size**: `h-4 w-4` (small), `h-5 w-5` (default), `h-6 w-6` (large)
- **Color**: Inherit from text color
- **Usage**: `import { IconName } from 'lucide-react'`

### Shadows
```javascript
boxShadow: {
  card: '0 20px 25px -15px rgba(15, 23, 42, 0.15)'
}
```

### Border Radius
- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)
- Full: `rounded-full` (9999px)

---

## Notes for AI Integration

When providing this document to AI assistants:

1. **Full Context**: Include this entire document for comprehensive understanding
2. **Component Reference**: Mention specific component names for targeted help
3. **Code Examples**: The code snippets are production-ready and can be used as-is
4. **Customization**: All values (colors, spacing, etc.) can be adjusted while maintaining consistency
5. **Accessibility**: Ensure all generated components follow the accessibility patterns
6. **Responsive**: Always consider mobile-first responsive design
7. **Dark Mode**: Include dark mode variants for all new components
8. **TypeScript**: Add type definitions if using TypeScript

### Example Prompt Structure
```
Using the Design_UI_temp.md guidelines:
- Create a [component type] that displays [functionality]
- Follow the [specific pattern] from the document
- Include [loading/error/empty] states
- Ensure it's responsive and has dark mode support
```

---

## Maintenance Notes

### When to Update This Document
- New component patterns emerge
- Design system tokens change (colors, spacing, etc.)
- Major library updates affect patterns
- New accessibility requirements
- Performance optimizations discovered
- User feedback necessitates changes

### Version History
- **v1.0** - Initial documentation (December 17, 2025)

---

**End of Design & UI Guidelines Template**

This document serves as a comprehensive reference for maintaining design consistency and accelerating development. Keep it updated as the project evolves and share it with team members and AI assistants for context-aware assistance.
