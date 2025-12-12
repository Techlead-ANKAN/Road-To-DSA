import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, Target, Trophy } from 'lucide-react'

import { fetchCourseOverview } from '../api/course.js'
import { useUser } from '../context/UserContext.jsx'
import { UserSetupCard } from '../components/UserSetupCard.jsx'
import { SmallStatCard } from '../components/SmallStatCard.jsx'
import { DashboardCharts } from '../components/DashboardCharts.jsx'
import { RecentActivity } from '../components/RecentActivity.jsx'
import { useProgressData } from '../hooks/useProgressData.js'

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

const DashboardPage = () => {
  const { user } = useUser()

  const courseQuery = useQuery({
    queryKey: ['courseOverview'],
    queryFn: fetchCourseOverview
  })

  const courseId = courseQuery.data?.courseId

  const { metrics, isLoading: progressLoading, error: progressError } = useProgressData({
    userId: user.userId,
    courseId,
    enabled: Boolean(courseId)
  })

  const statCards = useMemo(() => {
    const total = metrics?.totalProblems ?? courseQuery.data?.totalProblems ?? 0
    const completed = metrics?.completedProblems ?? 0
    const remaining = metrics?.remainingProblems ?? (total - completed)
    const completion = metrics?.completionPercentage ?? 0

    return [
      {
        label: 'Overall completion',
        value: `${completion}%`,
        helper: `${completed} solved`,
        icon: Trophy
      },
      {
        label: 'Problems remaining',
        value: remaining,
        helper: `${total} total`,
        icon: Target,
        accent: 'amber'
      },
      {
        label: 'Steps covered',
        value: `${metrics?.steps?.filter((step) => step.completionPercentage === 100).length || 0}/${courseQuery.data?.totalSteps || 0}`,
        helper: 'Fully completed steps',
        icon: CheckCircle2,
        accent: 'emerald'
      },
      {
        label: 'Total problems',
        value: total,
        helper: 'Across all steps',
        icon: BookOpen
      }
    ]
  }, [metrics, courseQuery.data])

  if (courseQuery.isLoading) {
    return <LoadingState />
  }

  if (courseQuery.error) {
    return <ErrorState message={courseQuery.error.message} />
  }

  if (!user.userId) {
    return <UserSetupCard />
  }

  if (progressError && progressError.status !== 404) {
    return <ErrorState message={progressError.message} />
  }

  if (progressLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {courseQuery.data.course_name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{courseQuery.data.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <SmallStatCard key={card.label} {...card} />
        ))}
      </div>

      <DashboardCharts difficulty={metrics?.difficulty} steps={metrics?.steps} />

      <RecentActivity activity={metrics?.lastCompleted} />
    </div>
  )
}

export default DashboardPage
