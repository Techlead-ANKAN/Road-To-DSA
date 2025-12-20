import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw, Code2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export const ExecutionControls = ({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStep, 
  onReset,
  currentStep,
  totalSteps,
  disabled = false
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Code2 className="h-5 w-5" />
          Execution Controls
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Step {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled || currentStep >= totalSteps}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isPlaying
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-primary text-white hover:bg-primary/90'
          )}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </button>

        <button
          onClick={onStep}
          disabled={disabled || currentStep >= totalSteps}
          className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <SkipForward className="h-4 w-4" />
          Step
        </button>

        <button
          onClick={onReset}
          disabled={disabled || currentStep === 0}
          className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Progress Bar */}
      {totalSteps > 0 && (
        <div className="w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <motion.div
            className="h-2 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  )
}

export const ExecutionOutput = ({ output, error, status, time, memory }) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Output
        </h3>
        {status && (
          <span
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-medium',
              status === 'Accepted'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            )}
          >
            {status}
          </span>
        )}
      </div>

      {/* Execution Stats */}
      {(time !== undefined || memory !== undefined) && (
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
          {time !== undefined && (
            <div>
              <span className="font-medium">Time:</span> {time}s
            </div>
          )}
          {memory !== undefined && (
            <div>
              <span className="font-medium">Memory:</span> {(memory / 1024).toFixed(2)} MB
            </div>
          )}
        </div>
      )}

      {/* Output Display */}
      <div className="space-y-3">
        {output && (
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Standard Output:
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-100 dark:bg-slate-950">
              {output}
            </pre>
          </div>
        )}

        {error && (
          <div>
            <div className="mb-1 text-xs font-medium text-rose-600 dark:text-rose-400">
              Error Output:
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </pre>
          </div>
        )}

        {!output && !error && (
          <div className="rounded-lg border border-dashed border-surface-border p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No output yet. Run your code to see results.
          </div>
        )}
      </div>
    </div>
  )
}
