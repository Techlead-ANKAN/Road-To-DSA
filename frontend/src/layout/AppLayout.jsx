import { Header } from './Header.jsx'

export const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
