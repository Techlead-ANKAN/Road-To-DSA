import { useEffect, useRef, useState } from 'react'
import { ExternalLink, FileCode2, History, RefreshCcw, X } from 'lucide-react'
import clsx from 'clsx'
import { ProgressBadge } from './ProgressBadge.jsx'

export const ProblemRow = ({
  problem,
  progress,
  onToggleComplete,
  onOpenCode,
  onLogRevision,
  indices
}) => {
  const isCompleted = progress?.completed
  const completedAt = progress?.completedAt ? new Date(progress.completedAt) : null
  const latestRevision = progress?.revisions?.[0]
  const [isRevisionOpen, setRevisionOpen] = useState(false)
  const [status, setStatus] = useState('solid')
  const [note, setNote] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!popoverRef.current || popoverRef.current.contains(event.target)) return
      setRevisionOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isRevisionOpen) return
    setStatus(latestRevision?.status === 'needs_review' ? 'needs_review' : 'solid')
    setNote('')
  }, [isRevisionOpen, latestRevision?.status])

  const statusLabel = status === 'solid' ? 'Solid' : 'Needs review'
  const latestStatusLabel = latestRevision?.status === 'needs_review' ? 'Needs review' : 'Solid'

  const formattedRevisionDate = latestRevision?.revisedAt
    ? new Date(latestRevision.revisedAt).toLocaleDateString()
    : null

  const handleRevisionSubmit = async (event) => {
    event.preventDefault()
    if (!onLogRevision || isSubmitting) return

    try {
      setSubmitting(true)
      await onLogRevision({ indices, status, note })
      setNote('')
      setRevisionOpen(false)
    } catch (error) {
      // toast handled upstream
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={clsx(
        'relative grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface p-4 transition md:grid-cols-[auto,1fr,auto,auto] md:items-center',
        isCompleted ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-900/20' : 'hover:-translate-y-0.5 hover:shadow-card',
        isRevisionOpen && 'z-20 shadow-card'
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(isCompleted)}
          onChange={() => onToggleComplete(indices, !isCompleted)}
          className="h-5 w-5 rounded border border-slate-300 text-primary focus:ring-primary"
          aria-label={problem.problem_name}
        />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{problem.problem_name.trim()}</p>
          {completedAt && (
            <p className="text-xs text-slate-500">Completed {completedAt.toLocaleDateString()}</p>
          )}
          {!completedAt && latestRevision && (
            <p className="text-xs text-slate-500">
              Revised {formattedRevisionDate}
              {latestRevision?.status ? ` • ${latestStatusLabel}` : ''}
            </p>
          )}
          {completedAt && latestRevision && (
            <p className="text-xs text-slate-500">
              Last revised {formattedRevisionDate}
              {latestRevision?.status ? ` • ${latestStatusLabel}` : ''}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBadge difficulty={problem.difficulty} />
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onOpenCode(indices, progress)}
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <FileCode2 className="h-4 w-4" />
          Code
        </button>
        <a
          href={problem.leetcode_link || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40',
            problem.leetcode_link
              ? 'border-surface-border text-slate-600 hover:border-primary hover:text-primary'
              : 'cursor-not-allowed border-slate-200 text-slate-300'
          )}
          aria-disabled={!problem.leetcode_link}
        >
          <ExternalLink className="h-4 w-4" />
          LeetCode
        </a>
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setRevisionOpen((prev) => !prev)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
              isRevisionOpen && 'opacity-0 pointer-events-none'
            )}
            aria-expanded={isRevisionOpen}
            aria-haspopup="dialog"
          >
            <History className="h-4 w-4" />
            {latestRevision ? 'Log revision' : 'Mark revised'}
          </button>
          {isRevisionOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-xl border border-surface-border bg-surface p-4 shadow-2xl">
              <form className="space-y-3" onSubmit={handleRevisionSubmit}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Revision log</p>
                    {latestRevision && formattedRevisionDate && (
                      <span className="text-xs text-slate-500">Last: {formattedRevisionDate}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevisionOpen(false)}
                    className="rounded-full border border-surface-border p-1 text-slate-500 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="Close revision log"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('solid')}
                    className={clsx(
                      'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition',
                      status === 'solid'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'border-surface-border text-slate-600 hover:border-primary hover:text-primary'
                    )}
                  >
                    Solid
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('needs_review')}
                    className={clsx(
                      'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition',
                      status === 'needs_review'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
                        : 'border-surface-border text-slate-600 hover:border-primary hover:text-primary'
                    )}
                  >
                    Needs review
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500" htmlFor={`revision-note-${indices.problemIndex}`}>
                    Notes (optional)
                  </label>
                  <textarea
                    id={`revision-note-${indices.problemIndex}`}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-xs text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-slate-200"
                    placeholder="Key takeaways from this revision"
                  />
                </div>
                <div className="space-y-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-80"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
                    Log revision ({statusLabel})
                  </button>
                  {progress?.revisions?.length ? (
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="font-medium text-slate-600 dark:text-slate-300">Recent</p>
                      {progress.revisions.slice(0, 3).map((entry, index) => {
                        const entryDate = entry.revisedAt ? new Date(entry.revisedAt).toLocaleDateString() : 'Unknown'
                        const entryStatus = entry.status === 'needs_review' ? 'Needs review' : 'Solid'

                        return (
                          <div
                            key={`${entry.revisedAt || index}-${index}`}
                            className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2"
                          >
                            <p className="font-medium text-slate-600 dark:text-slate-200">{entryDate}</p>
                            <p className="text-[10px] uppercase tracking-wide text-primary">{entryStatus}</p>
                            {entry.note && <p className="mt-1 text-[11px] text-slate-500">{entry.note}</p>}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-slate-500">No revisions yet. Logging helps stay on track.</p>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
