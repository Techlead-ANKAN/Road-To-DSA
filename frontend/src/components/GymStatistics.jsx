import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Dumbbell,
  Target,
  Award,
  Flame,
  BarChart3,
  Clock,
  Weight,
  Activity,
  Zap,
  Trophy,
} from 'lucide-react';

const GymStatistics = ({ statistics, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-surface-border p-4 animate-pulse"
          >
            <div className="h-10 bg-surface-hover rounded mb-2"></div>
            <div className="h-8 bg-surface-hover rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">⚠️ Failed to load statistics</p>
        <p className="text-xs sm:text-sm text-red-600/80 dark:text-red-400/80">
          {error?.response?.status === 404 
            ? 'Statistics endpoint not found. Please restart the backend server.'
            : error?.message || 'Unable to fetch gym statistics. Please check your connection and try refreshing.'}
        </p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-surface rounded-xl border border-surface-border p-6 text-center">
        <p className="text-text-secondary">No statistics available yet. Start working out!</p>
      </div>
    );
  }

  const stats = [
    {
      id: 'total-sessions',
      label: 'Total Sessions',
      value: statistics.totalSessions || 0,
      icon: Dumbbell,
      color: 'blue',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      iconClass: 'text-blue-600 dark:text-blue-400',
      description: 'All time workouts',
    },
    {
      id: 'monthly-sessions',
      label: 'This Month',
      value: statistics.totalSessionsThisMonth || 0,
      icon: Calendar,
      color: 'green',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      iconClass: 'text-green-600 dark:text-green-400',
      description: 'Sessions completed',
    },
    {
      id: 'weekly-sessions',
      label: 'This Week',
      value: statistics.totalSessionsThisWeek || 0,
      icon: Activity,
      color: 'purple',
      bgClass: 'bg-purple-50 dark:bg-purple-950/30',
      iconClass: 'text-purple-600 dark:text-purple-400',
      description: 'Sessions completed',
    },
    {
      id: 'current-streak',
      label: 'Current Streak',
      value: statistics.currentStreak || 0,
      icon: Flame,
      color: 'orange',
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
      iconClass: 'text-orange-600 dark:text-orange-400',
      description: 'Consecutive days',
      suffix: statistics.currentStreak === 1 ? 'day' : 'days',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface rounded-xl lg:rounded-2xl border border-surface-border p-3 sm:p-4 xl:p-5 2xl:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className={`p-2 sm:p-2.5 xl:p-3 rounded-lg ${stat.bgClass}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 ${stat.iconClass}`} />
              </div>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-xs sm:text-sm xl:text-base text-text-secondary font-medium">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p
                  className={`${
                    stat.valueSize || 'text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl'
                  } font-bold text-text-primary truncate`}
                  title={typeof stat.value === 'string' && stat.value.length > 15 ? stat.value : undefined}
                >
                  {stat.value}
                </p>
                {stat.suffix && (
                  <span className="text-xs sm:text-sm xl:text-base text-text-secondary font-medium">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs xl:text-sm text-text-secondary/70">
                {stat.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GymStatistics;
