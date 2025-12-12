import { ExternalLink, FileCode2 } from 'lucide-react'
import { ProgressBadge } from './ProgressBadge.jsx'
import clsx from 'clsx'

export const ProblemRow = ({
  problem,
  progress,
  onToggleComplete,
  onOpenCode,
  indices
}) => {
  const isCompleted = progress?.completed
  const completedAt = progress?.completedAt ? new Date(progress.completedAt) : null

  return (
    <div
      className={clsx(
        'grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface p-4 transition md:grid-cols-[auto,1fr,auto,auto] md:items-center',
        isCompleted ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-900/20' : 'hover:-translate-y-0.5 hover:shadow-card'
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
      </div>
    </div>
  )
}
