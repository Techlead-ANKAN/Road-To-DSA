import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Editor from '@monaco-editor/react'
import { Code2, Play, AlertCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

import { executeCode, analyzeCode, getDailyUsage } from '../api/visualize.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import { ExecutionControls, ExecutionOutput } from '../components/ExecutionControls.jsx'
import { VariableStateTable, ExecutionTrace, CallStack } from '../components/VisualizationPanels.jsx'

const languageOptions = [
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'c', label: 'C' }
]

const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = 10;
        int sum = x + y;
        System.out.println("Sum: " + sum);
        
        for (int i = 0; i < 3; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`

const DEFAULT_PYTHON_CODE = `def main():
    x = 5
    y = 10
    sum_val = x + y
    print(f"Sum: {sum_val}")
    
    for i in range(3):
        print(f"Iteration: {i}")

if __name__ == "__main__":
    main()`

const CodeVisualize = () => {
  const { theme } = useTheme()
  const { user } = useUser()
  const editorRef = useRef(null)
  const [code, setCode] = useState(DEFAULT_JAVA_CODE)
  const [language, setLanguage] = useState('java')
  const [stdin, setStdin] = useState('')
  
  // Execution state
  const [executionResult, setExecutionResult] = useState(null)
  const [codeAnalysis, setCodeAnalysis] = useState(null)
  
  // Visualization state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedLines, setHighlightedLines] = useState([])

  // Fetch daily usage
  const { data: usageData, refetch: refetchUsage } = useQuery({
    queryKey: ['dailyUsage', user?.userId],
    queryFn: () => getDailyUsage(user?.userId || 'default'),
    refetchInterval: 60000, // Refetch every minute
  })

  const usage = usageData?.usage || { used: 0, limit: 45, remaining: 45 }

  // Execute code mutation
  const executeMutation = useMutation({
    mutationFn: executeCode,
    onSuccess: (data) => {
      setExecutionResult(data)
      
      // Update usage from response
      if (data.usage) {
        refetchUsage()
        
        // Warning at 45 (limit reached)
        if (data.usage.used >= 45) {
          toast.error('🚫 Daily limit reached! You\'ve used all 45 executions for today.', {
            duration: 6000,
            icon: '🚫'
          })
        }
        // Warning at 40+ executions
        else if (data.usage.used >= 40) {
          toast((t) => (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">Getting close to limit!</p>
                <p className="text-xs text-slate-600">
                  {data.usage.remaining} executions remaining today
                </p>
              </div>
            </div>
          ), { duration: 5000 })
        }
      }
      
      if (data.status === 'Accepted' || data.output) {
        toast.success('Code executed successfully!')
      } else if (data.error) {
        toast.error('Compilation or runtime error')
      }
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Failed to execute code'
      
      // Handle rate limit error
      if (error.response?.status === 429) {
        toast.error((t) => (
          <div>
            <p className="font-medium">Daily Limit Reached!</p>
            <p className="text-xs text-slate-600 mt-1">
              You've used all 45 executions today. Come back tomorrow!
            </p>
          </div>
        ), { duration: 8000, icon: '🚫' })
      } else {
        toast.error(errorMsg)
      }
      
      console.error('Execution error:', error)
    }
  })

  // Analyze code mutation
  const analyzeMutation = useMutation({
    mutationFn: analyzeCode,
    onSuccess: (data) => {
      setCodeAnalysis(data)
    }
  })

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    if (newLanguage === 'java' && !code.trim()) {
      setCode(DEFAULT_JAVA_CODE)
    } else if (newLanguage === 'python' && !code.trim()) {
      setCode(DEFAULT_PYTHON_CODE)
    }
  }

  // Handle code execution
  const handleExecute = () => {
    if (!code.trim()) {
      toast.error('Please write some code first')
      return
    }

    // Check if limit reached
    if (usage.remaining <= 0) {
      toast.error('Daily limit reached! Come back tomorrow.', { duration: 5000 })
      return
    }

    setExecutionResult(null)
    setCurrentStep(0)
    setIsPlaying(false)
    
    executeMutation.mutate({ 
      code, 
      language, 
      stdin,
      userId: user?.userId || 'default'
    })
    analyzeMutation.mutate({ code, language })
  }

  // Playback controls
  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    if (codeAnalysis && currentStep < codeAnalysis.codeLines) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setHighlightedLines([])
  }

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && codeAnalysis && currentStep < codeAnalysis.codeLines) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (isPlaying && codeAnalysis && currentStep >= codeAnalysis.codeLines) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, codeAnalysis])

  // Highlight current line in editor
  useEffect(() => {
    if (editorRef.current && codeAnalysis && currentStep > 0) {
      const editor = editorRef.current
      const lineNumber = currentStep
      
      const decorations = editor.deltaDecorations(highlightedLines, [
        {
          range: new window.monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'bg-primary/10',
            glyphMarginClassName: 'bg-primary'
          }
        }
      ])
      
      setHighlightedLines(decorations)
      editor.revealLineInCenter(lineNumber)
    }
  }, [currentStep, codeAnalysis])

  // Handle editor mount
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    window.monaco = monaco
  }

  // Mock trace data for visualization (will be replaced with actual trace data)
  const mockTrace = codeAnalysis?.lines
    ?.filter(l => l.type === 'code')
    .slice(0, currentStep)
    .map((line, idx) => ({
      line: line.lineNumber,
      action: line.content.trim(),
      note: `Executing line ${line.lineNumber}`
    })) || []

  return (
    <div className="min-h-screen bg-slate-50 pb-8 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-surface-border bg-surface px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                <Code2 className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                Code Visualizer
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Write code, execute it, and visualize step-by-step execution with variable tracking
              </p>
            </div>
            
            {/* Daily Usage Counter */}
            <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 shadow-sm sm:px-5">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${usage.remaining <= 5 ? 'text-rose-600 dark:text-rose-400' : usage.remaining <= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>
                    {usage.remaining}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    / {usage.limit}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  executions left today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Limit Warning Banner */}
        {usage.remaining <= 10 && usage.remaining > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Running Low on Executions!</p>
              <p className="mt-1 text-xs">
                You have only {usage.remaining} execution{usage.remaining !== 1 ? 's' : ''} remaining today. The limit will reset tomorrow.
              </p>
            </div>
          </div>
        )}

        {/* Limit Reached Banner */}
        {usage.remaining <= 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Daily Limit Reached</p>
              <p className="mt-1 text-xs">
                You've used all {usage.limit} free executions for today. Come back tomorrow for more!
              </p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Getting Started</p>
            <p className="mt-1 text-xs">
              Select a language, write your code, and click Run to execute. Step through execution to see how your code runs line by line.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,450px]">
          {/* Left Column - Editor and Controls */}
          <div className="space-y-6">
            {/* Editor Card */}
            <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Code Editor
                </h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleExecute}
                    disabled={executeMutation.isPending || usage.remaining <= 0}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    title={usage.remaining <= 0 ? 'Daily limit reached' : 'Run code'}
                  >
                    <Play className="h-4 w-4" />
                    {executeMutation.isPending ? 'Running...' : usage.remaining <= 0 ? 'Limit Reached' : 'Run Code'}
                  </button>
                </div>
              </div>

              <div className="h-[400px] overflow-hidden rounded-xl border border-surface-border sm:h-[500px]">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: window.innerWidth > 1024 },
                    lineNumbers: 'on',
                    fontSize: 14,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Input Section */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Standard Input (Optional)
                </label>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program (one per line)"
                  className="h-20 w-full resize-none rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Execution Controls */}
            {codeAnalysis && (
              <ExecutionControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onStep={handleStep}
                onReset={handleReset}
                currentStep={currentStep}
                totalSteps={codeAnalysis.codeLines}
                disabled={executeMutation.isPending}
              />
            )}

            {/* Output */}
            {executionResult && (
              <ExecutionOutput
                output={executionResult.output}
                error={executionResult.error}
                status={executionResult.status}
                time={executionResult.time}
                memory={executionResult.memory}
              />
            )}
          </div>

          {/* Right Column - Visualization */}
          <div className="space-y-6">
            <ExecutionTrace trace={mockTrace} currentStep={currentStep} />
            
            <VariableStateTable 
              variables={[]}
              currentLine={currentStep}
            />

            {/* Code Analysis Stats */}
            {codeAnalysis && (
              <div className="rounded-2xl border border-surface-border bg-surface p-4 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Code Analysis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Lines:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {codeAnalysis.totalLines}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Code Lines:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {codeAnalysis.codeLines}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Comments:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {codeAnalysis.commentLines}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeVisualize
