import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Dumbbell,
  Clock,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ExerciseHistory = ({ historyData, isLoading, onPageChange, onSearch, onDateFilter }) => {
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleDateFilter = () => {
    onDateFilter(dateRange);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSearchQuery('');
    onSearch('');
    onDateFilter({ start: '', end: '' });
  };

  const toggleExpand = (exerciseName) => {
    setExpandedExercise(expandedExercise === exerciseName ? null : exerciseName);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 md:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl border border-surface-border p-4 animate-pulse"
          >
            <div className="h-6 bg-surface-hover rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-surface-hover rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!historyData || historyData.exercises.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 text-center">
        <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-text-secondary/30 mb-3 sm:mb-4" />
        <p className="text-text-secondary text-sm sm:text-base">
          No exercise history yet. Complete some workouts to see your progress!
        </p>
      </div>
    );
  }

  const { exercises, pagination } = historyData;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-surface border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-hover rounded-full"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
            showFilters || dateRange.start || dateRange.end
              ? 'bg-primary text-white border-primary'
              : 'bg-surface border-surface-border hover:bg-surface-hover'
          }`}
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {(searchQuery || dateRange.start || dateRange.end) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date Range Filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface border border-surface-border rounded-xl p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Date Range
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm mb-1.5 sm:mb-2">From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm mb-1.5 sm:mb-2">To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base bg-background border border-surface-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleDateFilter}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Cards */}
      <div className="space-y-3 md:space-y-4">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={`${exercise.name}-${index}`}
            exercise={exercise}
            isExpanded={expandedExercise === exercise.name}
            onToggle={() => toggleExpand(exercise.name)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-4">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-surface border border-surface-border rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-text-secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <span className="hidden sm:inline text-xs text-text-secondary">
              ({pagination.totalExercises} exercises)
            </span>
          </div>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-surface border border-surface-border rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({ exercise, isExpanded, onToggle }) => {
  const latestSession = exercise.sessions[0];
  const previousSession = exercise.sessions[1];

  // Calculate trend
  let trend = null;
  if (exercise.type === 'count' && latestSession && previousSession) {
    const latestAvg = latestSession.avgWeight || 0;
    const previousAvg = previousSession.avgWeight || 0;
    if (latestAvg > previousAvg) {
      trend = 'up';
    } else if (latestAvg < previousAvg) {
      trend = 'down';
    }
  }

  const categoryConfig = {
    warmup: { color: 'orange', label: 'Warm-up' },
    main: { color: 'blue', label: 'Main' },
    cardio: { color: 'red', label: 'Cardio' },
  };

  const config = categoryConfig[exercise.category] || categoryConfig.main;

  return (
    <motion.div
      layout
      className="bg-surface rounded-xl lg:rounded-2xl border border-surface-border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 xl:p-5 flex items-center justify-between hover:bg-surface-hover transition-colors"
      >
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <h3 className="text-sm sm:text-base xl:text-lg font-semibold truncate">
              {exercise.name}
            </h3>
            <span
              className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-${config.color}-50 dark:bg-${config.color}-950/30 text-${config.color}-600 dark:text-${config.color}-400`}
            >
              {config.label}
            </span>
            {trend && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs xl:text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              {exercise.totalSessions} sessions
            </span>
            {exercise.type === 'count' && exercise.personalRecords.maxWeight > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                PR: {exercise.personalRecords.maxWeight}kg
              </span>
            )}
            {exercise.type === 'time' && exercise.personalRecords.maxTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Best: {exercise.personalRecords.maxTime}min
              </span>
            )}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-border p-3 sm:p-4 xl:p-6">
              {/* Chart for count-based exercises */}
              {exercise.type === 'count' && exercise.sessions.length > 1 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                    Weight Progression
                  </h4>
                  <WeightProgressChart sessions={exercise.sessions} />
                </div>
              )}

              {/* Personal Records */}
              {exercise.type === 'count' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-background rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-text-secondary mb-1">Max Weight</p>
                    <p className="text-sm sm:text-base xl:text-lg font-bold">
                      {exercise.personalRecords.maxWeight}kg
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-text-secondary mb-1">Max Reps</p>
                    <p className="text-sm sm:text-base xl:text-lg font-bold">
                      {exercise.personalRecords.maxReps}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] sm:text-xs text-text-secondary mb-1">Max Volume</p>
                    <p className="text-sm sm:text-base xl:text-lg font-bold">
                      {Math.round(exercise.personalRecords.maxVolume)}kg
                    </p>
                  </div>
                </div>
              )}

              {/* Session History */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-3">Session History</h4>
                <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {exercise.sessions.map((session, index) => (
                    <SessionItem key={index} session={session} exerciseType={exercise.type} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Weight Progress Chart Component
const WeightProgressChart = ({ sessions }) => {
  // Reverse to show oldest to newest
  const sortedSessions = [...sessions].reverse().slice(-10); // Last 10 sessions

  const data = {
    labels: sortedSessions.map((s) => new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Avg Weight (kg)',
        data: sortedSessions.map((s) => s.avgWeight?.toFixed(1) || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-[200px] sm:h-[250px]">
      <Line data={data} options={options} />
    </div>
  );
};

// Session Item Component
const SessionItem = ({ session, exerciseType }) => {
  return (
    <div className="bg-background rounded-lg p-2 sm:p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium truncate">{session.workoutName}</p>
          <p className="text-[10px] sm:text-xs text-text-secondary">
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {exerciseType === 'count' && session.sets ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-text-secondary mb-1">
            <span>{session.totalSets} sets</span>
            <span>•</span>
            <span>Avg: {session.avgWeight?.toFixed(1)}kg × {Math.round(session.avgReps)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {session.sets.map((set, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] sm:text-xs bg-surface rounded border border-surface-border"
              >
                {set.reps} × {set.weight}kg
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm">
          <Clock className="w-3 h-3 inline mr-1" />
          {session.time} minutes
        </p>
      )}

      {session.notes && (
        <p className="mt-2 text-[10px] sm:text-xs text-text-secondary italic">
          Note: {session.notes}
        </p>
      )}
    </div>
  );
};

export default ExerciseHistory;
