import { useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { fetchUserProgress, initUserProgress } from '../api/progress.js'

export const useProgressData = ({ userId, courseId, enabled = true }) => {
  const shouldFetch = Boolean(enabled && userId && courseId)
  const ensured = useRef(false)

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

  return {
    progress: progressQuery.data,
    metrics: progressQuery.data?.metrics,
    isLoading: progressQuery.isLoading || initMutation.isLoading,
    isInitializing: initMutation.isLoading,
    error: progressQuery.error,
    refetch: progressQuery.refetch
  }
}
