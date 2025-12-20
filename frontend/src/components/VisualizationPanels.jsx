import { motion, AnimatePresence } from 'framer-motion'
import { Database, Activity } from 'lucide-react'
import clsx from 'clsx'

export const VariableStateTable = ({ variables = [], currentLine }) => {
  if (variables.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Database className="h-5 w-5" />
          Variables
        </h3>
        <div className="rounded-lg border border-dashed border-surface-border p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No variables tracked yet
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Database className="h-5 w-5" />
        Variables
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="pb-2 pr-4 text-left font-medium text-slate-600 dark:text-slate-400">
                Name
              </th>
              <th className="pb-2 pr-4 text-left font-medium text-slate-600 dark:text-slate-400">
                Type
              </th>
              <th className="pb-2 text-left font-medium text-slate-600 dark:text-slate-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {variables.map((variable, index) => (
                <motion.tr
                  key={variable.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-surface-border/50"
                >
                  <td className="py-2 pr-4 font-mono text-slate-700 dark:text-slate-300">
                    {variable.name}
                  </td>
                  <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">
                    {variable.type}
                  </td>
                  <td className="py-2 font-mono">
                    <span
                      className={clsx(
                        'rounded px-2 py-0.5',
                        variable.changed
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {String(variable.value)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const ExecutionTrace = ({ trace = [], currentStep }) => {
  if (trace.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Activity className="h-5 w-5" />
          Execution Trace
        </h3>
        <div className="rounded-lg border border-dashed border-surface-border p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No execution trace available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Activity className="h-5 w-5" />
        Execution Trace
      </h3>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {trace.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={clsx(
                'rounded-lg border p-3 text-sm transition-colors',
                index === currentStep
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-border bg-surface'
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  Step {index + 1}
                </span>
                <span className="font-mono text-xs text-primary">
                  Line {step.line}
                </span>
              </div>
              <div className="font-mono text-slate-700 dark:text-slate-300">
                {step.action}
              </div>
              {step.note && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {step.note}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const CallStack = ({ stack = [] }) => {
  if (stack.length === 0) return null

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Call Stack
      </h3>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {stack.map((frame, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={clsx(
                'rounded-lg border p-3',
                index === stack.length - 1
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-border bg-surface'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                  {frame.function}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Line {frame.line}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
