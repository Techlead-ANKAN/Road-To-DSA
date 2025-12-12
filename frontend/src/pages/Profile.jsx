import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

import { createOrFetchUser } from '../api/user.js'
import { exportSolvedCsv } from '../api/progress.js'
import { fetchCourseOverview } from '../api/course.js'
import { useUser } from '../context/UserContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useProgressData } from '../hooks/useProgressData.js'

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const ProfilePage = () => {
  const { user, setUser } = useUser()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' })

  const courseQuery = useQuery({
    queryKey: ['courseOverview'],
    queryFn: fetchCourseOverview
  })

  const courseId = courseQuery.data?.courseId

  const progressState = useProgressData({
    userId: user.userId,
    courseId,
    enabled: Boolean(courseId)
  })

  useEffect(() => {
    setForm({ name: user.name || '', email: user.email || '' })
  }, [user])

  const updateMutation = useMutation({
    mutationFn: createOrFetchUser,
    onSuccess: (data) => {
      setUser({ userId: data.userId, name: data.name, email: data.email })
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(error.message)
  })

  const exportMutation = useMutation({
    mutationFn: () => exportSolvedCsv({ userId: user.userId, courseId }),
    onSuccess: (response) => {
      const filename = `road-to-dsa-${user.name || 'progress'}.csv`
      downloadFile(response.data, filename)
      toast.success('Export ready')
    },
    onError: (error) => toast.error(error.message)
  })

  const solvedSummary = useMemo(() => {
    const total = progressState.metrics?.completedProblems || 0
    const completion = progressState.metrics?.completionPercentage || 0
    return { total, completion }
  }, [progressState.metrics])

  const onSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Provide a valid email')
      return
    }
    updateMutation.mutate({ name: form.name.trim(), email: form.email.trim() })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px,1fr]">
      <section className="space-y-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
        <p className="text-sm text-slate-500">
          Update your details to keep progress synchronized across devices.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="profile-name" className="text-sm font-medium text-slate-600">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
          <p className="mt-2 text-sm text-slate-500">
            Switch between light and dark mode. Your preference is saved locally.
          </p>
          <button
            type="button"
            onClick={toggleTheme}
            className="mt-4 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Toggle to {theme === 'light' ? 'dark' : 'light'} mode
          </button>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress export</h3>
          <p className="mt-2 text-sm text-slate-500">
            Download all solved problems and notes as a CSV file for backups or sharing.
          </p>
          <button
            type="button"
            onClick={() => {
              if (!user.userId) {
                toast.error('Create your profile to export data')
                return
              }
              if (!courseId) {
                toast.error('Course not ready yet')
                return
              }
              exportMutation.mutate()
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={exportMutation.isLoading}
          >
            <Download className="h-4 w-4" />
            {exportMutation.isLoading ? 'Preparing...' : 'Export solved problems'}
          </button>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress summary</h3>
          {user.userId ? (
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <p>
                Solved problems: <span className="font-semibold text-slate-900 dark:text-slate-100">{solvedSummary.total}</span>
              </p>
              <p>
                Completion: <span className="font-semibold text-slate-900 dark:text-slate-100">{solvedSummary.completion}%</span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Create a profile to view your personalized summary.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
