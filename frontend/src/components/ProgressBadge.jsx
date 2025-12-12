import clsx from 'clsx'

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-rose-100 text-rose-700'
}

export const ProgressBadge = ({ difficulty }) => {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        difficultyColors[difficulty] || 'bg-slate-200 text-slate-700'
      )}
    >
      {difficulty}
    </span>
  )
}
