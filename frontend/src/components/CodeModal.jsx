import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Editor from '@monaco-editor/react'
import { X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const languageOptions = [
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' }
]

const modalRoot = typeof document !== 'undefined' ? document.body : null

export const CodeModal = ({ open, onClose, onSave, problemName, initialData }) => {
  const { theme } = useTheme()
  const [code, setCode] = useState(initialData?.code || '')
  const [language, setLanguage] = useState(initialData?.codeLang || 'cpp')
  const [notes, setNotes] = useState(initialData?.notes || '')

  useEffect(() => {
    if (open) {
      setCode(initialData?.code || '')
      setLanguage(initialData?.codeLang || 'cpp')
      setNotes(initialData?.notes || '')
    }
  }, [open, initialData])

  const handleSave = () => {
    onSave({ code, codeLang: language, notes })
  }

  const content = useMemo(() => {
    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
        <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{problemName.trim()}</h3>
              <p className="text-xs text-slate-500">Store your solution privately. Nothing executes on the server.</p>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40"
              onClick={onClose}
              aria-label="Close code editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-6 py-4">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-500">Language</label>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="mt-1 rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-[50vh] overflow-hidden rounded-xl border border-surface-border">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                language={language === 'javascript' ? 'javascript' : language}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  fontSize: 14,
                  automaticLayout: true
                }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
                placeholder="Key ideas, tricky cases, or reminders"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-surface-border bg-surface px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Save code
            </button>
          </div>
        </div>
      </div>
    )
  }, [open, language, code, notes, problemName, onClose, onSave])

  if (!modalRoot) return null
  return createPortal(content, modalRoot)
}
