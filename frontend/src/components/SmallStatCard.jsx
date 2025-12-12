import clsx from 'clsx'

export const SmallStatCard = ({ label, value, helper, icon: Icon, accent = 'primary' }) => {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        {Icon && (
          <span
            className={clsx(
              'inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary',
              accent === 'emerald' && 'bg-emerald-100 text-emerald-600',
              accent === 'rose' && 'bg-rose-100 text-rose-600',
              accent === 'amber' && 'bg-amber-100 text-amber-600'
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {helper && <p className="mt-3 text-xs text-slate-500">{helper}</p>}
    </div>
  )
}
