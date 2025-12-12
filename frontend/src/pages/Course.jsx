import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { fetchCourseOverview, fetchCourseStep } from '../api/course.js'
import { markProblem, saveProblemCode } from '../api/progress.js'
import { useUser } from '../context/UserContext.jsx'
import { useProgressData } from '../hooks/useProgressData.js'
import { UserSetupCard } from '../components/UserSetupCard.jsx'
import { StepAccordion } from '../components/StepAccordion.jsx'
import { FilterBar } from '../components/FilterBar.jsx'
import { ProblemRow } from '../components/ProblemRow.jsx'
import { CodeModal } from '../components/CodeModal.jsx'

const LoadingState = () => (
  <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
    Loading course data...
  </div>
)

const ErrorState = ({ message }) => (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
    {message}
  </div>
)

const CoursePage = () => {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [selectedStep, setSelectedStep] = useState(0)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('All')
  const [codeModal, setCodeModal] = useState({ open: false })

  const courseQuery = useQuery({
    queryKey: ['courseOverview'],
    queryFn: fetchCourseOverview
  })

  const courseId = courseQuery.data?.courseId

  const stepQuery = useQuery({
    queryKey: ['courseStep', courseId, selectedStep],
    queryFn: () => fetchCourseStep(selectedStep),
    enabled: typeof selectedStep === 'number'
  })

  const progressState = useProgressData({
    userId: user.userId,
    courseId,
    enabled: Boolean(courseId)
  })

  const markMutation = useMutation({
    mutationFn: markProblem,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['progress', user.userId, courseId], (previous) => {
        if (!previous) return previous

        const updatedSteps = previous.steps.map((step) => {
          if (step.step_index !== variables.stepIndex) return step

          return {
            ...step,
            topics: step.topics.map((topic) => {
              if (topic.topic_index !== variables.topicIndex) return topic

              const updatedProblems = topic.problems.map((problem) => {
                if (problem.problem_index !== variables.problemIndex) return problem
                return { ...problem, ...data.problem }
              })

              return { ...topic, problems: updatedProblems }
            })
          }
        })

        return {
          ...previous,
          steps: updatedSteps,
          metrics: data.metrics
        }
      })

      toast.success(data.problem.completed ? 'Marked as completed' : 'Marked as incomplete')
    },
    onError: (error) => toast.error(error.message)
  })

  const saveCodeMutation = useMutation({
    mutationFn: saveProblemCode,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['progress', user.userId, courseId], (previous) => {
        if (!previous) return previous

        const updatedSteps = previous.steps.map((step) => {
          if (step.step_index !== variables.stepIndex) return step

          return {
            ...step,
            topics: step.topics.map((topic) => {
              if (topic.topic_index !== variables.topicIndex) return topic

              const updatedProblems = topic.problems.map((problem) => {
                if (problem.problem_index !== variables.problemIndex) return problem
                return { ...problem, ...data.problem }
              })

              return { ...topic, problems: updatedProblems }
            })
          }
        })

        return { ...previous, steps: updatedSteps }
      })

      toast.success('Solution saved')
      setCodeModal({ open: false })
    },
    onError: (error) => toast.error(error.message)
  })

  const handleToggleComplete = (indices, completed) => {
    if (!user.userId) {
      toast.error('Create your profile first')
      return
    }
    if (!courseId) {
      toast.error('Course not ready yet')
      return
    }
    markMutation.mutate({
      userId: user.userId,
      courseId,
      stepIndex: indices.stepIndex,
      topicIndex: indices.topicIndex,
      problemIndex: indices.problemIndex,
      completed
    })
  }

  const handleOpenCode = (indices, progress) => {
    if (!user.userId) {
      toast.error('Create your profile first')
      return
    }
    if (!courseId) {
      toast.error('Course not ready yet')
      return
    }
    setCodeModal({ open: true, indices, progress })
  }

  const handleSaveCode = ({ code, codeLang, notes }) => {
    if (!codeModal.indices) return
    if (!courseId) {
      toast.error('Course not ready yet')
      return
    }
    saveCodeMutation.mutate({
      userId: user.userId,
      courseId,
      stepIndex: codeModal.indices.stepIndex,
      topicIndex: codeModal.indices.topicIndex,
      problemIndex: codeModal.indices.problemIndex,
      code,
      codeLang,
      notes
    })
  }

  const closeModal = () => setCodeModal({ open: false })

  const progressStep = useMemo(() => {
    return progressState.progress?.steps?.find((step) => step.step_index === selectedStep)
  }, [progressState.progress, selectedStep])

  const stepData = stepQuery.data?.step

  const filteredTopics = useMemo(() => {
    if (!stepData) return []
    const query = search.trim().toLowerCase()
    const difficultyFilter = difficulty === 'All' ? null : difficulty

    return stepData.topics
      .map((topic) => {
        const problems = topic.problems.filter((problem, idx) => {
          const matchesDifficulty = difficultyFilter ? problem.difficulty === difficultyFilter : true
          const matchesQuery = query
            ? problem.problem_name.toLowerCase().includes(query)
            : true

          return matchesDifficulty && matchesQuery
        })

        return { ...topic, problems }
      })
      .filter((topic) => topic.problems.length > 0)
  }, [stepData, search, difficulty])

  if (courseQuery.isLoading || stepQuery.isLoading || progressState.isLoading) {
    return <LoadingState />
  }

  if (courseQuery.error) {
    return <ErrorState message={courseQuery.error.message} />
  }

  if (stepQuery.error) {
    return <ErrorState message={stepQuery.error.message} />
  }

  if (!user.userId) {
    return <UserSetupCard />
  }

  if (progressState.error && progressState.error.status !== 404) {
    return <ErrorState message={progressState.error.message} />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Steps overview</h2>
          <p className="mt-1 text-xs text-slate-500">Select a step to explore topics and problems.</p>
        </div>
        <StepAccordion
          steps={courseQuery.data.steps}
          selectedStep={selectedStep}
          onSelectStep={setSelectedStep}
          progressSummary={progressState.metrics?.steps}
        />
      </aside>

      <section className="space-y-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />

        {filteredTopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
            No problems match the selected filters.
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div key={topic.topic_index} className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Topic {topic.topic_index + 1}
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{topic.topic_name}</h3>
              </div>
              <div className="space-y-3">
                {topic.problems.map((problem) => {
                  const progressTopic = progressStep?.topics?.find((t) => t.topic_index === topic.topic_index)
                  const progressRecord = progressTopic?.problems?.find((item) => item.problem_index === problem.problem_index)

                  return (
                  <ProblemRow
                    key={problem.problem_index}
                    problem={problem}
                    progress={progressRecord}
                    indices={{
                      stepIndex: selectedStep,
                      topicIndex: topic.topic_index,
                      problemIndex: problem.problem_index
                    }}
                    onToggleComplete={handleToggleComplete}
                    onOpenCode={handleOpenCode}
                  />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </section>

      <CodeModal
        open={codeModal.open}
        onClose={closeModal}
        onSave={handleSaveCode}
        problemName={codeModal.open ? stepData?.topics?.[codeModal.indices?.topicIndex]?.problems?.[codeModal.indices?.problemIndex]?.problem_name || 'Problem' : ''}
        initialData={codeModal.progress}
      />
    </div>
  )
}

export default CoursePage
