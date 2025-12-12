import clsx from 'clsx'

export const StepAccordion = ({ steps = [], selectedStep, onSelectStep, progressSummary = [] }) => {
  const progressByStep = new Map(progressSummary.map((item) => [item.step_index, item]))

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const metrics = progressByStep.get(step.step_index) || {
          completed: 0,
          total: step.total_problems,
          completionPercentage: 0
        }

        return (
          <button
            type="button"
            key={step.step_index}
            onClick={() => onSelectStep(step.step_index)}
            className={clsx(
              'w-full rounded-2xl border border-surface-border bg-surface p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40',
              selectedStep === step.step_index ? 'ring-2 ring-primary/40' : 'hover:-translate-y-0.5 hover:shadow-card'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {step.step_index + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{step.step_name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {metrics.completed} of {metrics.total} problems completed
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {metrics.completionPercentage || 0}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(metrics.completionPercentage || 0, 100)}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
