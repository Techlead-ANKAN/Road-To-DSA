import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { fetchUserProgress, initUserProgress, logProblemRevision } from '../api/progress.js'

export const useProgressData = ({ userId, courseId, enabled = true }) => {
  const shouldFetch = Boolean(enabled && userId && courseId)
  const ensured = useRef(false)
  const queryClient = useQueryClient()

  const progressQuery = useQuery({
    queryKey: ['progress', userId, courseId],
    queryFn: () => fetchUserProgress({ userId, courseId }),
    enabled: shouldFetch,
    retry: false
  })

  const initMutation = useMutation({
    mutationFn: initUserProgress,
    onSuccess: () => {
      ensured.current = false
      progressQuery.refetch()
    },
    onError: (error) => {
      ensured.current = false
      toast.error(error.message)
    }
  })

  useEffect(() => {
    if (!shouldFetch) return

    if (progressQuery.error?.status === 404 && !ensured.current) {
      ensured.current = true
      initMutation.mutate({ userId, courseId })
    } else if (progressQuery.error && progressQuery.error.status !== 404) {
      toast.error(progressQuery.error.message)
    }
  }, [progressQuery.error, shouldFetch, initMutation, userId, courseId])

  const addRevisionMutation = useMutation({
    mutationFn: logProblemRevision,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['progress', userId, courseId], (prev) => {
        if (!prev) return prev

        const { stepIndex, topicIndex, problemIndex } = variables

        const updatedSteps = prev.steps.map((step) => {
          if (step.step_index !== stepIndex) return step

          const updatedTopics = step.topics.map((topic) => {
            if (topic.topic_index !== topicIndex) return topic

            const problemsCopy = [...topic.problems]
            if (!problemsCopy[problemIndex]) return topic

            problemsCopy[problemIndex] = {
              ...problemsCopy[problemIndex],
              revisions: data.revisions
            }

            return { ...topic, problems: problemsCopy }
          })

          return { ...step, topics: updatedTopics }
        })

        return { ...prev, steps: updatedSteps }
      })

      toast.success('Revision logged')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return {
    progress: progressQuery.data,
    metrics: progressQuery.data?.metrics,
    isLoading: progressQuery.isLoading || initMutation.isLoading,
    isInitializing: initMutation.isLoading,
    error: progressQuery.error,
    refetch: progressQuery.refetch,
    logRevision: addRevisionMutation.mutateAsync,
    isLoggingRevision: addRevisionMutation.isLoading
  }
}
