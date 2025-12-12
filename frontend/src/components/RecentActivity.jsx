import dayjs from 'dayjs'

export const RecentActivity = ({ activity }) => {
  if (!activity) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
        <h3 className="text-sm font-medium text-slate-500">Recent activity</h3>
        <p className="mt-3 text-sm text-slate-500">No problems solved yet. Start with Step 1.</p>
      </div>
    )
  }

  const completedAt = dayjs(activity.completedAt).format('MMM D, YYYY h:mm A')

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
      <h3 className="text-sm font-medium text-slate-500">Recent activity</h3>
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">{activity.problem_name.trim()}</p>
        <p className="mt-2 text-xs text-slate-500">
          {activity.step_name} • {activity.topic_name}
        </p>
        <p className="mt-1 text-xs text-slate-500">Completed {completedAt}</p>
      </div>
    </div>
  )
}
