import dayjs from 'dayjs'
import clsx from 'clsx'

export const RecentActivity = ({ activity, revision }) => {
  const hasActivity = Boolean(activity)
  const hasRevision = Boolean(revision)

  if (!hasActivity && !hasRevision) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
        <h3 className="text-sm font-medium text-slate-500">Recent activity</h3>
        <p className="mt-3 text-sm text-slate-500">No activity yet. Log a solve or revision to see it here.</p>
      </div>
    )
  }

  const completedAt = hasActivity ? dayjs(activity.completedAt).format('MMM D, YYYY h:mm A') : null
  const revisedAt = hasRevision && revision.revisedAt ? dayjs(revision.revisedAt).format('MMM D, YYYY h:mm A') : null
  const revisionStatus = revision?.status === 'needs_review' ? 'Needs review' : 'Solid'

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
      <h3 className="text-sm font-medium text-slate-500">Recent activity</h3>
      <div className="mt-4 space-y-4">
        {hasActivity && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-primary">{activity.problem_name.trim()}</p>
            <p className="mt-2 text-xs text-slate-500">
              {activity.step_name} • {activity.topic_name}
            </p>
            <p className="mt-1 text-xs text-slate-500">Completed {completedAt}</p>
          </div>
        )}

        {hasRevision && (
          <div className="rounded-xl border border-surface-border bg-surface-muted p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{revision.problem_name.trim()}</p>
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                  revision?.status === 'needs_review'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                )}
              >
                {revisionStatus}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {revision.step_name} • {revision.topic_name}
            </p>
            {revisedAt && <p className="mt-1 text-xs text-slate-500">Revised {revisedAt}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
