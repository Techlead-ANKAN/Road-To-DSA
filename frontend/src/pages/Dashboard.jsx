import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, History, Target, Trophy, Calendar, Dumbbell, Flame, Clock, Weight } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import dayjs from 'dayjs'

import { fetchCourseOverview } from '../api/course.js'
import { useUser } from '../context/UserContext.jsx'
import { UserSetupCard } from '../components/UserSetupCard.jsx'
import { SmallStatCard } from '../components/SmallStatCard.jsx'
import { DashboardCharts } from '../components/DashboardCharts.jsx'
import { RecentActivity } from '../components/RecentActivity.jsx'
import { NoticeBoard } from '../components/NoticeBoard.jsx'
import { useProgressData } from '../hooks/useProgressData.js'
import { fetchTodayCount, fetchCompletedCount, fetchWeeklyStats, fetchTasksByDate, fetchWorkStreak } from '../api/task.js'
import { fetchMonthCount, fetchStreak, fetchMonthlyStats, fetchGymLogByDate } from '../api/gym.js'

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

  // Fetch task statistics
  const { data: todayTaskCount } = useQuery({
    queryKey: ['tasks', 'today', user.userId],
    queryFn: () => fetchTodayCount(user.userId),
    enabled: !!user.userId,
  })

  const { data: completedTaskCount } = useQuery({
    queryKey: ['tasks', 'completed', user.userId],
    queryFn: () => fetchCompletedCount(user.userId),
    enabled: !!user.userId,
  })

  const { data: weeklyTaskStats } = useQuery({
    queryKey: ['tasks', 'weekly', user.userId],
    queryFn: () => fetchWeeklyStats(user.userId),
    enabled: !!user.userId,
  })

  const { data: workStreak } = useQuery({
    queryKey: ['tasks', 'work-streak', user.userId],
    queryFn: () => fetchWorkStreak(user.userId),
    enabled: !!user.userId,
  })

  // Fetch gym statistics
  const { data: gymMonthCount } = useQuery({
    queryKey: ['gym', 'month', user.userId],
    queryFn: () => fetchMonthCount(user.userId),
    enabled: !!user.userId,
  })

  const { data: gymStreak } = useQuery({
    queryKey: ['gym', 'streak', user.userId],
    queryFn: () => fetchStreak(user.userId),
    enabled: !!user.userId,
  })

  const { data: gymMonthlyStats } = useQuery({
    queryKey: ['gym', 'monthly', user.userId],
    queryFn: () => fetchMonthlyStats(user.userId),
    enabled: !!user.userId,
  })

  // Fetch today's tasks
  const todayDate = dayjs().format('YYYY-MM-DD')
  const { data: todayTasks = [] } = useQuery({
    queryKey: ['tasks', 'today-tasks', user.userId, todayDate],
    queryFn: () => fetchTasksByDate(user.userId, todayDate),
    enabled: !!user.userId,
  })

  // Fetch today's gym workout
  const { data: todayGymLog } = useQuery({
    queryKey: ['gym', 'today-log', user.userId, todayDate],
    queryFn: () => fetchGymLogByDate(user.userId, todayDate),
    enabled: !!user.userId,
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
        label: 'Revisions (7d)',
        value: metrics?.revisions?.recent7Days ?? 0,
        helper: `${metrics?.revisions?.total ?? 0} total logged`,
        icon: History
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
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">Track your progress and stay on top of your goals</p>
      </div>

      {/* New Productivity & Gym Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <SmallStatCard
          label="Tasks Today"
          value={`${todayTaskCount?.completed ?? 0} / ${todayTaskCount?.assigned ?? 0}`}
          helper="Completed / Assigned"
          icon={Calendar}
          accent="blue"
        />
        <SmallStatCard
          label="Gym Today"
          value={todayGymLog?.completed ? 'Done' : (todayGymLog ? 'Pending' : 'Not Assigned')}
          helper={todayGymLog?.workoutDayId?.name || 'No workout'}
          icon={Dumbbell}
          accent={todayGymLog?.completed ? 'emerald' : 'orange'}
        />
        <SmallStatCard
          label="Work Streak"
          value={workStreak?.streak ?? 0}
          helper="Days (75%+ completion)"
          icon={Target}
          accent="purple"
        />
        <SmallStatCard
          label="Gym Streak"
          value={gymStreak?.streak ?? 0}
          helper="Consecutive days"
          icon={Flame}
          accent="orange"
        />
      </div>

      {/* Notice Board */}
      <NoticeBoard />

      {/* Today's Tasks & Weekly Stats */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="bg-surface rounded-2xl border border-surface-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Tasks ({todayTasks.length})
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No tasks scheduled for today</p>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-surface-border"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="w-4 h-4 rounded border-gray-300 text-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate">{task.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : task.priority === 'medium'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Task Stats */}
        {weeklyTaskStats && (
          <div className="bg-surface rounded-2xl border border-surface-border p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Task Completion (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyTaskStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--color-text-secondary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface border border-surface-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-sm mb-1">{data.day}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Assigned: {data.assigned} tasks
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Completed: {data.completed} tasks
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Today's Gym Workout & Monthly Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Today's Gym Workout */}
        <div className="bg-surface rounded-2xl border border-surface-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Today's Workout
          </h3>
          {todayGymLog ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {todayGymLog.workoutDayId?.name || 'Workout'}
                </p>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    todayGymLog.completed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}
                >
                  {todayGymLog.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {(todayGymLog.workoutDayId?.exercises || []).map((exercise, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-hover rounded-lg border border-surface-border"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {exercise.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {exercise.type === 'count' ? (
                        <>
                          <span className="flex items-center gap-1">
                            <span className="font-mono">{exercise.defaultSets} sets</span>
                          </span>
                          <span>×</span>
                          <span className="flex items-center gap-1">
                            <span className="font-mono">{exercise.defaultReps} reps</span>
                          </span>
                          {exercise.defaultWeight > 0 && (
                            <>
                              <span>@</span>
                              <span className="flex items-center gap-1">
                                <Weight className="w-3 h-3" />
                                <span className="font-mono">{exercise.defaultWeight} kg</span>
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">{exercise.defaultTime} min</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">No workout scheduled for today</p>
            </div>
          )}
        </div>

        {/* Monthly Gym Activity */}
        {gymMonthlyStats && (
          <div className="bg-surface rounded-2xl border border-surface-border p-6">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Gym Activity - {dayjs().format('MMMM YYYY')}
            </h3>
            <div className="space-y-3">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div 
                    key={day} 
                    className="text-center text-xs font-medium text-slate-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {(() => {
                  const today = dayjs()
                  const firstDay = today.startOf('month')
                  const daysInMonth = today.daysInMonth()
                  const startDayOfWeek = firstDay.day()
                  
                  // Create a map from gymMonthlyStats for quick lookup
                  const statsMap = new Map()
                  gymMonthlyStats.forEach(stat => {
                    const date = dayjs(stat.date)
                    if (date.month() === today.month() && date.year() === today.year()) {
                      statsMap.set(date.date(), stat)
                    }
                  })
                  
                  const cells = []
                  
                  // Empty cells before first day
                  for (let i = 0; i < startDayOfWeek; i++) {
                    cells.push(
                      <div key={`empty-${i}`} className="aspect-square" />
                    )
                  }
                  
                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const stat = statsMap.get(day)
                    const isToday = today.date() === day
                    const isFuture = dayjs().date(`${today.year()}-${today.month() + 1}-${day}`) > today
                    
                    let bgColor = 'bg-slate-100 dark:bg-slate-800' // Default: no workout
                    let textColor = 'text-slate-400'
                    let borderColor = ''
                    let title = 'No workout assigned'
                    
                    if (stat?.assigned) {
                      if (stat.completed) {
                        bgColor = 'bg-green-500 hover:bg-green-600'
                        textColor = 'text-white font-semibold'
                        title = `✓ Completed - ${stat.workoutName || 'Workout'}`
                      } else if (!isFuture) {
                        bgColor = 'bg-red-500 hover:bg-red-600'
                        textColor = 'text-white font-semibold'
                        title = `✗ Missed - ${stat.workoutName || 'Workout'}`
                      } else {
                        bgColor = 'bg-orange-200 dark:bg-orange-800'
                        textColor = 'text-slate-700 dark:text-slate-200'
                        title = `Scheduled - ${stat.workoutName || 'Workout'}`
                      }
                    }
                    
                    if (isToday) {
                      borderColor = 'ring-2 ring-blue-500 ring-offset-2 ring-offset-surface'
                    }
                    
                    cells.push(
                      <div
                        key={day}
                        title={title}
                        className={`
                          aspect-square rounded-md flex items-center justify-center
                          text-xs sm:text-sm transition-all cursor-pointer
                          ${bgColor} ${textColor} ${borderColor}
                        `}
                      >
                        {day}
                      </div>
                    )
                  }
                  
                  return cells
                })()}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 border-t border-surface-border text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-slate-600 dark:text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-slate-600 dark:text-slate-400">Missed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-800" />
                  <span className="text-slate-600 dark:text-slate-400">Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800" />
                  <span className="text-slate-600 dark:text-slate-400">No workout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task & Gym Charts - REMOVED, NOW SHOWN ABOVE */}

      {/* Course Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {courseQuery.data.course_name}
        </h2>
        <p className="text-sm text-slate-500 mb-4">{courseQuery.data.description}</p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <SmallStatCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      <DashboardCharts difficulty={metrics?.difficulty} steps={metrics?.steps} />

      <RecentActivity activity={metrics?.lastCompleted} revision={metrics?.revisions?.last} />
    </div>
  )
}

export default DashboardPage
